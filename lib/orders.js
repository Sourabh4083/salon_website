import Razorpay from "razorpay";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import { revalidateProducts } from "@/lib/products";

// Abandoned checkouts (Pay clicked, never paid) are removed after this long.
export const PENDING_ORDER_TTL_MS = 3 * 24 * 60 * 60 * 1000;

// Payments in these states have money behind them. "authorized" is a payment
// Razorpay will capture (auto-capture) or the shop can capture from the dashboard.
const PAID_STATES = new Set(["authorized", "captured"]);

export function razorpayClient() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

/**
 * Marks the order behind `razorpayOrderId` as paid by `paymentId`.
 *
 * Safe to call more than once for the same payment (browser retry, webhook
 * arriving after the browser call): only the first call changes anything.
 * The payment is fetched from Razorpay and its amount compared against the
 * order, so a valid signature for some other, cheaper payment is not enough.
 *
 * Pass `userId` to also require that the order belongs to that user.
 * Returns { order } or { error, status }. Call dbConnect first.
 */
export async function confirmPayment({ razorpayOrderId, paymentId, userId }) {
  const order = await Order.findOne({ razorpayOrderId }).lean();
  if (!order || (userId && String(order.user) !== String(userId))) {
    return { error: "Order not found", status: 404 };
  }

  // Already confirmed (retry or webhook got here first).
  if (order.paymentStatus === "paid") {
    if (order.razorpayPaymentId === paymentId) return { order };
    return { error: "This order was paid with a different payment", status: 409 };
  }

  const payment = await razorpayClient().payments.fetch(paymentId);
  if (
    payment.order_id !== razorpayOrderId ||
    payment.currency !== "INR" ||
    Number(payment.amount) !== order.amountPaise ||
    !PAID_STATES.has(payment.status)
  ) {
    console.error("Payment does not match order", {
      order: String(order._id),
      paymentId,
      paymentOrder: payment.order_id,
      amount: payment.amount,
      expected: order.amountPaise,
      status: payment.status,
    });
    return { error: "Payment does not match this order", status: 400 };
  }

  // Only one caller can flip unpaid -> paid; everyone else sees null here.
  const paid = await Order.findOneAndUpdate(
    { _id: order._id, paymentStatus: "unpaid" },
    {
      $set: { paymentStatus: "paid", razorpayPaymentId: paymentId },
      $unset: { pendingExpiresAt: 1 },
    },
    { new: true }
  ).lean();

  if (!paid) {
    const current = await Order.findById(order._id).lean();
    if (current?.paymentStatus === "paid" && current.razorpayPaymentId === paymentId) {
      return { order: current };
    }
    return { error: "Order could not be confirmed", status: 409 };
  }

  await afterPaid(paid);
  return { order: paid };
}

// Stock and cart updates for a newly paid order. Runs exactly once
// per order, because only the caller that marked it paid gets here.
async function afterPaid(order) {
  // Decrement only when enough is left, so two buyers of the last item can
  // never drive stock below zero. Whatever could not be taken is recorded
  // on the order for the shop to sort out (the customer has already paid).
  const shortfall = [];
  for (const item of order.cartItem) {
    const { modifiedCount } = await Product.updateOne(
      { _id: item.product, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } }
    );
    if (modifiedCount === 0) shortfall.push(`${item.title} × ${item.quantity}`);
  }
  if (shortfall.length) {
    await Order.updateOne({ _id: order._id }, { $set: { stockShortfall: shortfall } });
    order.stockShortfall = shortfall;
    console.error(`Order ${order._id} paid but out of stock:`, shortfall);
  }
  revalidateProducts();

  await Cart.deleteOne({ user: order.user });
}
