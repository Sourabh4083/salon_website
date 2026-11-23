import crypto from "crypto";
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { confirmPayment } from "@/lib/orders";

// Backstop for payments whose browser never reached /api/checkout (tab
// closed, network dropped after paying). Razorpay calls this server-to-server.
//
// Setup: Razorpay Dashboard → Settings → Webhooks → add
//   https://<your-domain>/api/razorpay/webhook
// with the events "payment.captured" and "order.paid", choose a secret, and
// set the same secret as RAZORPAY_WEBHOOK_SECRET. Without that variable this
// route does nothing and checkout relies on the browser call alone.

function isValidWebhookSignature(rawBody, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = Buffer.from(
    crypto.createHmac("sha256", secret).update(rawBody).digest("hex"),
    "utf8"
  );
  const actual = Buffer.from(String(signature), "utf8");
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

export async function POST(req) {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  // The signature covers the exact bytes sent, so read the body as text.
  const rawBody = await req.text();
  if (!isValidWebhookSignature(rawBody, req.headers.get("x-razorpay-signature"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const payment = event?.payload?.payment?.entity;
  if (!["payment.captured", "order.paid"].includes(event?.event) || !payment?.order_id) {
    // Acknowledge events we don't act on so Razorpay doesn't retry them.
    return NextResponse.json({ ok: true });
  }

  try {
    await dbConnect();
    const result = await confirmPayment({
      razorpayOrderId: payment.order_id,
      paymentId: payment.id,
    });
    if (result.error) {
      // 404 = a payment for an order this site didn't create (or one already
      // expired). Nothing to retry, so acknowledge it; it is logged for review.
      console.error("Webhook could not confirm payment", payment.id, result.error);
      if (result.status === 404) return NextResponse.json({ ok: true });
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    // 500 makes Razorpay retry later.
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
