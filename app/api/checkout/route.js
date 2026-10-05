import crypto from "crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { dbConnect } from "@/lib/dbConnect";
import { priceCart } from "@/lib/pricing";
import { normaliseMobile } from "@/lib/validate";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import Product from "@/models/Product";

/**
 * Confirms the payment really came from Razorpay by recomputing the HMAC
 * over "<order_id>|<payment_id>" with our secret. Without this check anyone
 * could post a made-up payment id and get a free "paid" order.
 */
function isValidRazorpaySignature(paymentInfo) {
  const orderId = paymentInfo?.razorpay_order_id;
  const paymentId = paymentInfo?.razorpay_payment_id;
  const signature = paymentInfo?.razorpay_signature;

  if (!orderId || !paymentId || !signature) return false;

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "utf8");
  const actualBuf = Buffer.from(String(signature), "utf8");

  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

export async function POST(request) {
  try {
    await dbConnect();
    const user = await getCurrentUser();

    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { cartItem, userInfo, paymentInfo } = body;

    // Prices and total are recomputed from the database, never trusted
    // from the request body.
    const priced = await priceCart(cartItem);
    if (priced.error) {
      return NextResponse.json({ error: priced.error }, { status: 400 });
    }

    if (!isValidRazorpaySignature(paymentInfo)) {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // The payment is already taken at this point, so a badly typed number is
    // stored as entered rather than failing the order.
    const phone = normaliseMobile(userInfo?.phone) || String(userInfo?.phone || "").trim();

    const newOrder = await Order.create({
      user: user.id,
      cartItem: priced.items,
      userInfo: {
        name: userInfo?.name,
        phone,
        address: userInfo?.address,
      },
      totalAmount: priced.totalAmount,
      subtotal: priced.subtotal,
      shippingAmount: priced.shippingAmount,
      taxableAmount: priced.taxableAmount,
      gstAmount: priced.gstAmount,
      gstRate: priced.gstRate,
      paymentStatus: "paid",
    });

    // Draw down stock for what was just bought.
    await Promise.all(
      priced.items.map((item) =>
        Product.updateOne(
          { _id: item.product },
          { $inc: { stock: -item.quantity } }
        )
      )
    );

    await Cart.deleteOne({ user: user.id });

    return NextResponse.json({ message: "Order saved", orderId: newOrder._id });
  } catch (error) {
    console.error("❌ Error saving order:", error);
    return NextResponse.json({ error: "Failed to save order" }, { status: 500 });
  }
}