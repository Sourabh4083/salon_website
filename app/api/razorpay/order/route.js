import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { dbConnect } from "@/lib/dbConnect";
import { priceCart } from "@/lib/pricing";

export async function POST(req) {
    try {
        const user = await getCurrentUser();
        if (!user || !user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        // The client sends the cart contents only. The amount charged is
        // computed here from database prices — never taken from the body.
        const { cartItem } = await req.json();

        const priced = await priceCart(cartItem);
        if (priced.error) {
            return NextResponse.json({ error: priced.error }, { status: 400 });
        }

        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const order = await instance.orders.create({
            amount: Math.round(priced.totalAmount * 100),
            currency: "INR",
            receipt: `rcpt_${user.id}_${Date.now()}`,
        });


        return NextResponse.json(order);
    } catch (err) {
        console.error("❌ Razorpay Error (full):", err);
        return NextResponse.json(
            { error: "Failed to create Razorpay order" },
            { status: 500 }
        );
    }
}