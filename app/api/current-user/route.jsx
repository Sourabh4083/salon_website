import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
export async function GET(request) {
    const token = request.cookies.get("token")?.value

    if (!token) {
        return NextResponse.json({ user: null }, { status: 200 })
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET)
        return NextResponse.json({ user }, { status: 200 })
    } catch (err) {
        return NextResponse.json({ user: null }, { status: 401 })
    }
}