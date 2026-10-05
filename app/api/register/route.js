
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs"
import { dbConnect } from "@/lib/dbConnect";
import { setSessionCookie } from "@/lib/auth";
import { normaliseUsername, normaliseMobile, USERNAME_HINT } from "@/lib/validate";
import User from "@/models/User";

export async function POST(req) {
    try {

        const body = await req.json()
        const name = String(body.name || "").trim()
        const { password, confirmPassword } = body

        if (!name || !body.username || !body.phone || !password) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 })
        }

        const username = normaliseUsername(body.username)
        if (!username) {
            return NextResponse.json({ error: `Username must be ${USERNAME_HINT}` }, { status: 400 })
        }

        const phone = normaliseMobile(body.phone)
        if (!phone) {
            return NextResponse.json({ error: "Enter a valid 10-digit mobile number" }, { status: 400 })
        }

        // Mirrors the schema's minlength so the user gets a clear message
        // instead of a generic 500 from a failed insert.
        if (typeof password !== "string" || password.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters" },
                { status: 400 }
            )
        }

        if (password !== confirmPassword) {
            return NextResponse.json({ error: "Passwords do not match" }, { status: 400 })
        }

        await dbConnect()

        const existingUser = await User.findOne({ username })
        if (existingUser) {
            return NextResponse.json({ error: "That username is already taken" }, { status: 400})
        }


        const hashedPassword = await bcrypt.hash(password, 10)


        const newUser = await User.create({
            name,
            username,
            phone,
            password: hashedPassword,
            role: "user"
        })

        // Sign the new user in straight away so they can continue whatever
        // they were doing (usually checkout) without a second login step.
        return setSessionCookie(
            NextResponse.json({ message: "User registered successfully" }),
            newUser
        )
    } catch (error) {
        // Two simultaneous signups with the same username race past the
        // findOne check; the unique index catches it here.
        if (error?.code === 11000) {
            return NextResponse.json({ error: "That username is already taken" }, { status: 400 })
        }
        console.error("Registration error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500})
    }
}
