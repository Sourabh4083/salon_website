import { NextResponse } from "next/server";
import bcrypt from "bcryptjs"
import { dbConnect } from "@/lib/dbConnect";
import { setSessionCookie } from "@/lib/auth";
import { normaliseMobile } from "@/lib/validate";
import { getHits, addHit, clearHits, minutesLeft, clientIp } from "@/lib/rateLimit";
import User from "@/models/User";

const WINDOW_MS = 15 * 60 * 1000
const MAX_PER_PHONE = 5   // wrong passwords for one number before it is locked
const MAX_PER_IP = 30     // wrong passwords from one device/network (stops number-hopping bots)

// Compared against when the number has no account, so a wrong number takes as
// long as a wrong password and response time does not reveal which numbers exist.
const DUMMY_HASH = "$2b$12$PioxG3cM4yRYcAZ0BSs2.OTKmb5DtReMzr1ADCERcwoxLlKDjYr7u"

const INVALID = "Wrong mobile number or password"

export async function POST(req) {
    try {
        const body = await req.json().catch(() => ({}))
        const phone = normaliseMobile(body.phone)
        const password = String(body.password || "")

        if (!phone || !password) {
            return NextResponse.json({ error: INVALID }, { status: 401 })
        }

        await dbConnect()

        const phoneKey = `login:phone:${phone}`
        const ipKey = `login:ip:${clientIp(req)}`
        const [phoneHits, ipHits] = await Promise.all([getHits(phoneKey), getHits(ipKey)])
        if (phoneHits >= MAX_PER_PHONE || ipHits >= MAX_PER_IP) {
            const mins = await minutesLeft(phoneHits >= MAX_PER_PHONE ? phoneKey : ipKey)
            return NextResponse.json(
                { error: `Too many wrong attempts. Please try again in ${mins} minute${mins === 1 ? "" : "s"}.` },
                { status: 429 }
            )
        }

        const user = await User.findOne({ phone })
        const isMatch = await bcrypt.compare(password, user?.password || DUMMY_HASH)

        if (!user || !isMatch) {
            await Promise.all([addHit(phoneKey, WINDOW_MS), addHit(ipKey, WINDOW_MS)])
            return NextResponse.json({ error: INVALID }, { status: 401 })
        }

        await clearHits(phoneKey)

        return setSessionCookie(
            NextResponse.json({ message: "Login successful", mustChangePassword: Boolean(user.mustChangePassword) }),
            user
        )
    } catch (error) {
        console.error("Login error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
