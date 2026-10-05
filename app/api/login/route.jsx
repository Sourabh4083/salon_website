
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs"
import { dbConnect } from "@/lib/dbConnect";
import { setSessionCookie } from "@/lib/auth";
import User from "@/models/User";

export async function POST(req) {
    const body = await req.json()
    const login = String(body.username || "").trim().toLowerCase()
    const password = body.password

    if (!login || !password) {
        return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    await dbConnect()

    // Accounts created before usernames existed only have an email, so an
    // email typed here still finds them.
    const user = await User.findOne(login.includes("@") ? { email: login } : { username: login })
    if (!user) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }


    const isMatch = await bcrypt.compare(String(password), user.password)
    if (!isMatch) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }


    return setSessionCookie(NextResponse.json({ message: "Login successful" }), user)
}
