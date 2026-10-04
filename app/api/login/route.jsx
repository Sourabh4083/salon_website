
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET

export async function POST(req) {
    const { email, password } = await req.json()

    if (!email || !password) {
        return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    await dbConnect()

    const user = await User.findOne({ email })
    if (!user) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }


    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }


    const token = jwt.sign(
        {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: "7d" }
    )


     const response = NextResponse.json({ message: "Login successful" });

  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}