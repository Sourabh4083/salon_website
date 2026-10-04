"use client";

import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { Lock, MapPin, Mail, User, ShieldCheck, Loader2 } from "lucide-react";
import { formateCurrency } from "@/utils/formatCurrency";
import { orderTotals } from "@/lib/totals";
import { site, gstPercent } from "@/lib/site";

export default function CheckoutPage() {
  const { cartItem, clearCart, user } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", address: "" });

  // Prefill from the user already loaded in CartContext.
  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      name: prev.name || user.name || "",
      email: prev.email || user.email || "",
    }));
  }, [user]);

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Display only. The amount actually charged is recomputed on the server
  // with the same function (lib/pricing.js).
  const { subtotal: subTotal, shipping, total, taxable, gst } = orderTotals(
    cartItem.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  const payload = () => cartItem.map((item) => ({ _id: item._id, quantity: item.quantity }));

  const handleOrder = async () => {
    if (!form.name || !form.email || !form.address) {
      toast.error("Please fill in all delivery details");
      return;
    }
    if (cartItem.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setSubmitting(true);
    try {
      const ok = await loadRazorpayScript();
      if (!ok) throw new Error("Could not load the payment gateway");

      const razorpayRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItem: payload() }),
      });
      const razorpayData = await razorpayRes.json();
      if (!razorpayRes.ok) throw new Error(razorpayData.error || "Failed to start payment");

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayData.amount,
        currency: "INR",
        name: site.name,
        description: "Order payment",
        order_id: razorpayData.id,
        prefill: { name: form.name, email: form.email },
        theme: { color: "#14233b" },
        modal: { ondismiss: () => setSubmitting(false) },
        handler: async (response) => {
          const saveOrderRes = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              cartItem: payload(),
              paymentInfo: response,
              userInfo: { name: form.name, email: form.email, address: form.address },
            }),
          });
          const saveOrderData = await saveOrderRes.json();
          if (!saveOrderRes.ok) {
            toast.error("Order failed to save: " + (saveOrderData.error || "unknown error"));
            setSubmitting(false);
            return;
          }
          await fetch("/api/cart", { method: "DELETE" });
          clearCart();
          router.push(`/order-success?id=${saveOrderData.orderId}`);
        },
      });
      rzp.open();
    } catch (err) {
      toast.error(err.message || "Something went wrong");
      setSubmitting(false);
    }
  };

  if (cartItem.length === 0) {
    return (
      <main className="container-x py-20 text-center">
        <h1 className="text-2xl font-medium">Nothing to check out</h1>
        <p className="mt-2 text-sm text-muted">Your cart is empty.</p>
        <Link href="/#products" className="btn-primary mt-6">Browse wigs</Link>
      </main>
    );
  }

  return (
    <main className="container-x py-8 sm:py-12">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-medium">Checkout</h1>
        <span className="pill border border-line text-muted"><Lock className="h-3 w-3" /> Secure</span>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Delivery form */}
        <section className="card p-6 sm:p-8">
          <h2 className="text-lg font-medium">Delivery details</h2>
          <p className="mt-1 text-sm text-muted">Where should we send your order?</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleOrder();
            }}
            className="mt-6 space-y-5"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="label">Full name</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input id="name" name="name" value={form.name} onChange={handleChange} required className="input pl-10" placeholder="Aarav Sharma" />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="label">Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required className="input pl-10" placeholder="you@example.com" />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="address" className="label">Delivery address</label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <textarea
                  id="address"
                  name="address"
                  rows={4}
                  value={form.address}
                  onChange={handleChange}
                  required
                  className="input resize-none pl-10"
                  placeholder="House / flat, street, city, state, PIN code"
                />
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full py-4 text-base">
              {submitting ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Opening secure payment…</>
              ) : (
                <><Lock className="h-4 w-4" /> Pay {formateCurrency(total)}</>
              )}
            </button>

            <p className="flex items-center justify-center gap-1.5 text-xs text-muted">
              <ShieldCheck className="h-3.5 w-3.5" /> Payments are processed by Razorpay. We never see your card details.
            </p>
          </form>
        </section>

        {/* Summary */}
        <aside className="card h-fit p-6 lg:sticky lg:top-28">
          <h2 className="text-lg font-medium">Order summary</h2>
          <ul className="mt-4 max-h-80 space-y-4 overflow-y-auto pr-1">
            {cartItem.map((item) => (
              <li key={item._id} className="flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  {item.image && <Image src={item.image} alt={item.title} fill sizes="56px" className="object-cover" />}
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[10px] font-bold text-white">
                    {item.quantity}
                  </span>
                </div>
                <p className="line-clamp-2 flex-1 text-sm font-medium leading-snug">{item.title}</p>
                <p className="text-sm font-semibold">{formateCurrency(item.price * item.quantity)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-3 border-t border-line pt-5 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="font-medium">{formateCurrency(subTotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd className="font-medium">{shipping === 0 ? <span className="text-success">Free</span> : formateCurrency(shipping)}</dd></div>
            <div className="h-px bg-line" />
            <div className="flex justify-between"><dt className="font-semibold">Total</dt><dd className="text-xl font-semibold">{formateCurrency(total)}</dd></div>
          </dl>
          <dl className="mt-4 space-y-1 border-t border-line pt-4 text-xs text-muted">
            <div className="flex justify-between"><dt>Taxable value</dt><dd>{formateCurrency(taxable, 2)}</dd></div>
            <div className="flex justify-between"><dt>GST ({gstPercent}%) included</dt><dd>{formateCurrency(gst, 2)}</dd></div>
            <div className="flex justify-between"><dt>Seller GSTIN</dt><dd>{site.gstin}</dd></div>
          </dl>
        </aside>
      </div>
    </main>
  );
}
