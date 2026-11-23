"use client";

import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { Lock, ShieldCheck, Loader2, Plus } from "lucide-react";
import AddressForm from "@/components/AddressForm";
import { AddressText, sendAddress } from "@/components/AddressBook";
import { MAX_ADDRESSES } from "@/lib/address";
import { formateCurrency } from "@/utils/formatCurrency";
import { orderTotals } from "@/lib/totals";
import { site, gstPercent, whatsappLink } from "@/lib/site";

export default function CheckoutPage() {
  const { cartItem, clearCart, user } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  // Set when payment succeeded but confirming the order didn't.
  const [failedPayment, setFailedPayment] = useState(null);

  // Saved addresses (null while loading), which one is chosen, and an
  // address used for this order only (not saved to the account).
  const [addresses, setAddresses] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [oneOff, setOneOff] = useState(null);
  const [adding, setAdding] = useState(false);
  const [saveNew, setSaveNew] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetch("/api/addresses")
      .then((res) => (res.ok ? res.json() : { addresses: [] }))
      .catch(() => ({ addresses: [] }))
      .then((data) => {
        if (cancelled) return;
        const list = data.addresses || [];
        setAddresses(list);
        // The default address comes first.
        setSelectedId((current) => current || list[0]?.id || null);
        if (list.length === 0) setAdding(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const selected =
    selectedId === "one-off" ? oneOff : addresses?.find((a) => a.id === selectedId) || null;
  const canSave = (addresses?.length || 0) < MAX_ADDRESSES;
  const hasChoices = (addresses?.length || 0) > 0 || Boolean(oneOff);

  const chooseNewAddress = async (address) => {
    if (saveNew && canSave) {
      const data = await sendAddress("/api/addresses", "POST", address);
      if (data.error) return data;
      setAddresses(data.addresses);
      setSelectedId(data.id);
      toast.success("Address saved to your account");
    } else {
      setOneOff(address);
      setSelectedId("one-off");
    }
    setAdding(false);
  };

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  // Display only. The amount actually charged is recomputed on the server
  // with the same function (lib/pricing.js).
  const { subtotal: subTotal, shipping, total, taxable, gst } = orderTotals(
    cartItem.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  const payload = () => cartItem.map((item) => ({ _id: item._id, quantity: item.quantity }));

  // Runs once Razorpay says the payment went through. The money has been
  // taken by now, so a failure here must never be silent: the customer gets
  // a lasting panel with the payment id, a retry, and a way to reach the shop.
  // Retrying is safe because the server confirms each payment only once.
  const confirmOrder = async (paymentInfo) => {
    setSubmitting(true);
    setFailedPayment(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentInfo }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "We couldn't confirm your order");

      clearCart();
      router.push(`/order-success?id=${data.orderId}`);
    } catch (err) {
      setFailedPayment({ paymentInfo, message: err.message || "We couldn't confirm your order" });
      setSubmitting(false);
    }
  };

  const handleOrder = async () => {
    if (!selected) {
      toast.error("Please choose a delivery address");
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

      // The delivery details go with the cart: the order is saved (unpaid)
      // before payment, so what is paid for can't change afterwards.
      const razorpayRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItem: payload(),
          address: selected,
        }),
      });
      const razorpayData = await razorpayRes.json().catch(() => ({}));
      if (!razorpayRes.ok) throw new Error(razorpayData.error || "Failed to start payment");

      const rzp = new window.Razorpay({
        key: razorpayData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayData.amount,
        currency: "INR",
        name: site.name,
        description: "Order payment",
        order_id: razorpayData.id,
        prefill: { name: selected.name, contact: `+91${selected.phone}` },
        theme: { color: "#14233b" },
        modal: { ondismiss: () => setSubmitting(false) },
        handler: (response) => confirmOrder(response),
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
        <Link href="/#products" className="btn-primary mt-6">Browse products</Link>
      </main>
    );
  }

  return (
    <main className="container-x py-8 sm:py-12">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-medium">Checkout</h1>
        <span className="pill border border-line text-muted"><Lock className="h-3 w-3" /> Secure</span>
      </div>

      {failedPayment && (
        <div role="alert" className="mt-6 rounded-xl border border-red-300 bg-red-50 p-5 text-sm text-red-800">
          <p className="font-semibold">Your payment went through, but we couldn&apos;t confirm your order.</p>
          <p className="mt-1">
            {failedPayment.message}. Please don&apos;t pay again. Try confirming once more, or contact us with
            your payment ID and we&apos;ll sort it out.
          </p>
          <p className="mt-2">
            Payment ID:{" "}
            <span className="select-all font-mono font-semibold">{failedPayment.paymentInfo?.razorpay_payment_id}</span>
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => confirmOrder(failedPayment.paymentInfo)}
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Try again
            </button>
            {whatsappLink() && (
              <a
                href={whatsappLink(`Hi, I paid for an order but it wasn't confirmed. Payment ID: ${failedPayment.paymentInfo?.razorpay_payment_id}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
              >
                Contact us on WhatsApp
              </a>
            )}
            {site.phone && <span className="self-center">or call {site.phone}</span>}
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Delivery address */}
        <section className="card p-6 sm:p-8">
          <h2 className="text-lg font-medium">Delivery address</h2>
          <p className="mt-1 text-sm text-muted">Where should we send your order?</p>

          {addresses === null ? (
            <div className="mt-6 space-y-3" aria-busy="true">
              <div className="h-24 animate-pulse bg-slate-100" />
              <div className="h-24 animate-pulse bg-slate-100" />
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {hasChoices && (
                <fieldset className="space-y-3">
                  <legend className="sr-only">Choose a delivery address</legend>
                  {[...addresses, ...(oneOff ? [{ ...oneOff, id: "one-off" }] : [])].map((a) => (
                    <label
                      key={a.id}
                      className={`flex cursor-pointer gap-3 border p-4 transition-colors ${selectedId === a.id ? "border-ink bg-surface" : "border-line hover:border-slate-400"}`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={a.id}
                        checked={selectedId === a.id}
                        onChange={() => setSelectedId(a.id)}
                        className="mt-1 h-4 w-4 shrink-0"
                      />
                      <div className="min-w-0">
                        <AddressText address={a} />
                        {a.id === "one-off" && <p className="mt-1 text-xs text-muted">For this order only (not saved)</p>}
                      </div>
                    </label>
                  ))}
                </fieldset>
              )}

              {adding ? (
                <div className={hasChoices ? "border border-ink p-4 sm:p-5" : ""}>
                  {hasChoices && <p className="mb-4 font-medium">New address</p>}
                  <AddressForm
                    initial={{ name: user?.name || "", phone: user?.phone || "" }}
                    onSubmit={chooseNewAddress}
                    onCancel={hasChoices ? () => setAdding(false) : undefined}
                    submitLabel="Deliver here"
                  >
                    {canSave ? (
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={saveNew} onChange={(e) => setSaveNew(e.target.checked)} className="h-4 w-4" />
                        Save this address to my account
                      </label>
                    ) : (
                      <p className="text-xs text-muted">You have {MAX_ADDRESSES} saved addresses, so this one is used for this order only.</p>
                    )}
                  </AddressForm>
                </div>
              ) : (
                <button type="button" onClick={() => setAdding(true)} className="btn-outline w-full">
                  <Plus className="h-4 w-4" /> Deliver to a new address
                </button>
              )}
            </div>
          )}

          <div className="mt-6 space-y-3 border-t border-line pt-6">
            <button
              type="button"
              onClick={handleOrder}
              disabled={submitting || !selected || adding}
              className="btn-primary w-full py-4 text-base"
            >
              {submitting ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Opening secure payment…</>
              ) : (
                <><Lock className="h-4 w-4" /> Pay {formateCurrency(total)}</>
              )}
            </button>
            {adding && hasChoices && (
              <p className="text-center text-xs text-muted">Finish or cancel the new address to continue.</p>
            )}
            {adding && !hasChoices && (
              <p className="text-center text-xs text-muted">Add your delivery address above to continue.</p>
            )}

            <p className="flex items-center justify-center gap-1.5 text-xs text-muted">
              <ShieldCheck className="h-3.5 w-3.5" /> Payments are processed by Razorpay. We never see your card details.
            </p>
          </div>
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
