"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

const OPTIONS = [
  { value: "pending", label: "Pending (not shipped yet)" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

// Delivery status and courier details for one order. The customer sees the
// same values on their My orders page.
export default function OrderStatusEditor({ order, onSaved }) {
  const [form, setForm] = useState({
    deliveryStatus: order.deliveryStatus || "pending",
    courier: order.courier || "",
    trackingNumber: order.trackingNumber || "",
    trackingUrl: order.trackingUrl || "",
  });
  const [saving, setSaving] = useState(false);

  const saved = {
    deliveryStatus: order.deliveryStatus || "pending",
    courier: order.courier || "",
    trackingNumber: order.trackingNumber || "",
    trackingUrl: order.trackingUrl || "",
  };
  const dirty = Object.keys(form).some((k) => form[k] !== saved[k]);

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    if (saving || !dirty) return;
    if (form.deliveryStatus === "cancelled" && saved.deliveryStatus !== "cancelled") {
      const ok = window.confirm(
        "Mark this order as cancelled? This does not refund the payment. Refund it from the Razorpay dashboard."
      );
      if (!ok) return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${order._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to update order");
      onSaved(data.order);
      toast.success("Order updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const id = String(order._id);
  return (
    <form onSubmit={save} className="mt-5 grid gap-3 border-t border-line pt-4 text-sm sm:grid-cols-2 lg:grid-cols-[180px_1fr_1fr_1.5fr_auto] lg:items-end">
      <div>
        <label htmlFor={`status-${id}`} className="label">Delivery status</label>
        <select id={`status-${id}`} name="deliveryStatus" value={form.deliveryStatus} onChange={set} className="input">
          {OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={`courier-${id}`} className="label">Courier</label>
        <input id={`courier-${id}`} name="courier" value={form.courier} onChange={set} maxLength={60} className="input" placeholder="Delhivery" />
      </div>
      <div>
        <label htmlFor={`awb-${id}`} className="label">Tracking number</label>
        <input id={`awb-${id}`} name="trackingNumber" value={form.trackingNumber} onChange={set} maxLength={80} className="input" placeholder="AWB / consignment no." />
      </div>
      <div>
        <label htmlFor={`url-${id}`} className="label">Tracking link</label>
        <input id={`url-${id}`} name="trackingUrl" type="url" value={form.trackingUrl} onChange={set} maxLength={500} className="input" placeholder="https://…" />
      </div>
      <button type="submit" disabled={saving || !dirty} className="btn-primary">
        {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save
      </button>
    </form>
  );
}
