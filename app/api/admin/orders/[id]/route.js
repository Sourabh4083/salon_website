import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { requireAdmin } from "@/lib/auth";
import Order from "@/models/Order";

const STATUSES = ["pending", "shipped", "delivered", "cancelled"];
// Which timestamp to stamp the first time an order reaches a status.
const STAMP = { shipped: "shippedAt", delivered: "deliveredAt", cancelled: "cancelledAt" };

function cleanText(value, max) {
  return String(value ?? "").trim().slice(0, max);
}

// Only http(s) links, so a pasted "javascript:" URL can never reach the
// customer's "Track package" button.
function cleanUrl(value) {
  const raw = cleanText(value, 500);
  if (!raw) return "";
  try {
    const url = new URL(raw);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

// PATCH /api/admin/orders/:id  { deliveryStatus, courier, trackingNumber, trackingUrl }
export async function PATCH(req, { params }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const deliveryStatus = String(body.deliveryStatus || "");
  if (!STATUSES.includes(deliveryStatus)) {
    return NextResponse.json({ error: "Choose a valid delivery status" }, { status: 400 });
  }

  const trackingUrl = cleanUrl(body.trackingUrl);
  if (trackingUrl === null) {
    return NextResponse.json({ error: "Tracking link must start with https://" }, { status: 400 });
  }

  try {
    await dbConnect();
    const order = await Order.findOne({ _id: id, paymentStatus: "paid" });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    order.deliveryStatus = deliveryStatus;
    order.courier = cleanText(body.courier, 60);
    order.trackingNumber = cleanText(body.trackingNumber, 80);
    order.trackingUrl = trackingUrl;
    const stamp = STAMP[deliveryStatus];
    if (stamp && !order[stamp]) order[stamp] = new Date();
    await order.save();

    return NextResponse.json({
      order: {
        _id: String(order._id),
        deliveryStatus: order.deliveryStatus,
        courier: order.courier,
        trackingNumber: order.trackingNumber,
        trackingUrl: order.trackingUrl,
        shippedAt: order.shippedAt,
        deliveredAt: order.deliveredAt,
        cancelledAt: order.cancelledAt,
      },
    });
  } catch (err) {
    console.error("Update order status error:", err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
