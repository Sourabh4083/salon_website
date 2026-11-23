import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { dbConnect } from "@/lib/dbConnect";
import { priceCart } from "@/lib/pricing";
import { cleanAddress, addressLines } from "@/lib/address";
import { razorpayClient, PENDING_ORDER_TTL_MS } from "@/lib/orders";
import Order from "@/models/Order";

// Starts a payment. The order is saved here, unpaid, with the items and total
// priced from the database; the Razorpay order is created for exactly that
// amount. /api/checkout later only marks this saved order as paid, so nothing
// sent after payment can change what was bought or what it cost.
export async function POST(req) {
    try {
        const user = await getCurrentUser();
        if (!user || !user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { cartItem, address } = await req.json().catch(() => ({}));

        // Same rules as the address forms (lib/address.js), so no order can
        // be placed with an address the courier can't deliver to.
        const { data: shippingAddress, error: addressError } = cleanAddress(address);
        if (addressError) {
            return NextResponse.json({ error: addressError }, { status: 400 });
        }

        await dbConnect();

        // The client sends product ids and quantities only. Prices and the
        // amount charged come from the database.
        const priced = await priceCart(cartItem);
        if (priced.error) {
            return NextResponse.json({ error: priced.error }, { status: 400 });
        }

        const amountPaise = Math.round(priced.totalAmount * 100);

        const order = await Order.create({
            user: user.id,
            cartItem: priced.items,
            shippingAddress,
            userInfo: {
                name: shippingAddress.name,
                phone: shippingAddress.phone,
                address: addressLines(shippingAddress).join("\n"),
            },
            totalAmount: priced.totalAmount,
            subtotal: priced.subtotal,
            shippingAmount: priced.shippingAmount,
            taxableAmount: priced.taxableAmount,
            gstAmount: priced.gstAmount,
            gstRate: priced.gstRate,
            amountPaise,
            paymentStatus: "unpaid",
            pendingExpiresAt: new Date(Date.now() + PENDING_ORDER_TTL_MS),
        });

        let rzpOrder;
        try {
            rzpOrder = await razorpayClient().orders.create({
                amount: amountPaise,
                currency: "INR",
                // Razorpay limits receipts to 40 characters; the ObjectId is 24.
                receipt: `order_${order._id}`,
                notes: { orderId: String(order._id) },
            });
        } catch (err) {
            await Order.deleteOne({ _id: order._id });
            throw err;
        }

        await Order.updateOne({ _id: order._id }, { $set: { razorpayOrderId: rzpOrder.id } });

        return NextResponse.json({
            id: rzpOrder.id,
            amount: rzpOrder.amount,
            currency: rzpOrder.currency,
            // Sent from here so a missing build-time env var can't break checkout.
            keyId: process.env.RAZORPAY_KEY_ID,
        });
    } catch (err) {
        console.error("❌ Razorpay Error (full):", err);
        return NextResponse.json(
            { error: "Failed to create Razorpay order" },
            { status: 500 }
        );
    }
}
