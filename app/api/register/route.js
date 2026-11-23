import { NextResponse } from "next/server";
import bcrypt from "bcryptjs"
import { dbConnect } from "@/lib/dbConnect";
import { setSessionCookie, BCRYPT_ROUNDS } from "@/lib/auth";
import { normaliseMobile, passwordProblem } from "@/lib/validate";
import { addHit, getHits, clientIp } from "@/lib/rateLimit";
import User from "@/models/User";

const SIGNUP_WINDOW_MS = 60 * 60 * 1000
const MAX_SIGNUPS_PER_IP = 10 // per hour; stops bots mass-creating accounts

const TAKEN = "This mobile number is already registered. Please sign in instead."

export async function POST(req) {
    try {
        const body = await req.json().catch(() => ({}))
        const name = String(body.name || "").trim().slice(0, 80)
        const password = String(body.password || "")
        const confirmPassword = String(body.confirmPassword || "")

        if (!name || !body.phone || !password) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 })
        }

        const phone = normaliseMobile(body.phone)
        if (!phone) {
            return NextResponse.json({ error: "Enter a valid 10-digit mobile number" }, { status: 400 })
        }

        const problem = passwordProblem(password, phone)
        if (problem) {
            return NextResponse.json({ error: problem }, { status: 400 })
        }

        if (password !== confirmPassword) {
            return NextResponse.json({ error: "Passwords do not match" }, { status: 400 })
        }

        await dbConnect()

        const ipKey = `signup:ip:${clientIp(req)}`
        if ((await getHits(ipKey)) >= MAX_SIGNUPS_PER_IP) {
            return NextResponse.json(
                { error: "Too many sign-ups from this device. Please try again later." },
                { status: 429 }
            )
        }
        await addHit(ipKey, SIGNUP_WINDOW_MS)

        if (await User.exists({ phone })) {
            return NextResponse.json({ error: TAKEN }, { status: 400 })
        }

        const newUser = await User.create({
            name,
            phone,
            password: await bcrypt.hash(password, BCRYPT_ROUNDS),
            role: "user",
        })

        // Sign the new user in straight away so they can continue whatever
        // they were doing (usually checkout) without a second login step.
        return setSessionCookie(
            NextResponse.json({ message: "User registered successfully" }),
            newUser
        )
    } catch (error) {
        // Two simultaneous sign-ups with the same number race past the
        // exists() check; the unique index catches it here.
        if (error?.code === 11000) {
            return NextResponse.json({ error: TAKEN }, { status: 400 })
        }
        console.error("Registration error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
