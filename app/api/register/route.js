
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/User";

export async function POST(req) {
    try {

        const { name, email, password } = await req.json()
        
        if (!name || !email || !password) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 })
        }

        // Mirrors the schema's minlength so the user gets a clear message
        // instead of a generic 500 from a failed insert.
        if (typeof password !== "string" || password.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters" },
                { status: 400 }
            )
        }

        await dbConnect()
        
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400})
        }
        
        
        const hashedPassword = await bcrypt.hash(password, 10)
        
        
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "user"
        })

        // Sign the new user in straight away so they can continue whatever
        // they were doing (usually checkout) without a second login step.
        const token = jwt.sign(
            { id: newUser._id, email: newUser.email, name: newUser.name, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )

        const response = NextResponse.json({ message: "User registered successfully" })
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        })
        return response
    } catch (error) {
        // Two simultaneous signups with the same email race past the
        // findOne check; the unique index catches it here.
        if (error?.code === 11000) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 })
        }
        console.error("Registration error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500})
    }
}