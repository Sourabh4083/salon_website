import crypto from "crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { dbConnect } from "@/lib/dbConnect";
import { confirmPayment } from "@/lib/orders";

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

// Called by the browser after Razorpay reports a successful payment. It only
// confirms the order saved in /api/razorpay/order; the cart, prices and
// address were fixed there. Safe to retry: a repeat returns the same order.
export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paymentInfo } = await request.json().catch(() => ({}));

    if (!isValidRazorpaySignature(paymentInfo)) {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    await dbConnect();
    const result = await confirmPayment({
      razorpayOrderId: paymentInfo.razorpay_order_id,
      paymentId: paymentInfo.razorpay_payment_id,
      userId: user.id,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ message: "Order saved", orderId: result.order._id });
  } catch (error) {
    console.error("❌ Error saving order:", error);
    return NextResponse.json({ error: "Failed to save order" }, { status: 500 });
  }
}
