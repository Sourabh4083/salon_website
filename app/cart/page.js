"use client";
import { useCart } from "@/context/CartContext";
import { formateCurrency } from "@/utils/formatCurrency";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";
import { orderTotals } from "@/lib/totals";
import { site, gstPercent } from "@/lib/site";

export default function CartPage() {
  const { cartItem, removeFromCart, updateQuantity, totalItem } = useCart();

  // Same function the server uses to decide what is charged.
  const { subtotal, shipping, total, gst } = orderTotals(
    cartItem.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
  const toFree = Math.max(0, site.shipping.freeAt - subtotal);
  const progress = Math.min(100, (subtotal / site.shipping.freeAt) * 100);

  if (cartItem.length === 0) {
    return (
      <main className="container-x py-20">
        <div className="card mx-auto flex max-w-lg flex-col items-center gap-4 px-6 py-16 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand/10 text-brand-ink">
            <ShoppingBag className="h-7 w-7" />
          </span>
          <h1 className="text-2xl font-medium">Your cart is empty</h1>
          <p className="max-w-sm text-sm text-muted">
            You have not added anything yet. Have a look through the collection.
          </p>
          <Link href="/#products" className="btn-primary mt-2">
            Start shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container-x py-8 sm:py-12">
      <h1 className="text-3xl font-medium">
        Your cart <span className="text-lg font-semibold text-muted">({totalItem} {totalItem === 1 ? "item" : "items"})</span>
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Items */}
        <section className="space-y-4">
          {/* Free shipping bar */}
          <div className="card p-4">
            <p className="text-sm">
              {toFree > 0 ? (
                <>Add <span className="font-semibold">{formateCurrency(toFree)}</span> more for free delivery</>
              ) : (
                <span className="font-semibold text-success">You have free delivery</span>
              )}
            </p>
            <div className="mt-2 h-1 overflow-hidden bg-slate-100">
              <div
                className="h-full bg-brand-2 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <ul className="card divide-y divide-line">
            {cartItem.map((item) => (
              <li key={item._id} className="flex gap-4 p-4 sm:p-5">
                <Link href={`/product/${item._id}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-28 sm:w-28">
                  {item.image && (
                    <Image src={item.image} alt={item.title} fill sizes="112px" className="object-cover" />
                  )}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/product/${item._id}`} className="line-clamp-2 font-semibold leading-snug hover:text-brand-ink">
                      {item.title}
                    </Link>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      aria-label={`Remove ${item.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-muted">{formateCurrency(item.price)} each</p>

                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center rounded-lg border border-line bg-white">
                      <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="grid h-9 w-9 place-items-center rounded-l-lg hover:bg-slate-100" aria-label="Decrease quantity">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="grid h-9 w-9 place-items-center rounded-r-lg hover:bg-slate-100" aria-label="Increase quantity">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="font-semibold">{formateCurrency(item.price * item.quantity)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <Link href="/#products" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-ink hover:underline">
            ← Continue shopping
          </Link>
        </section>

        {/* Summary */}
        <aside className="card h-fit p-6 lg:sticky lg:top-28">
          <h2 className="text-lg font-medium">Order summary</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="font-medium">{formateCurrency(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd className="font-medium">{shipping === 0 ? <span className="text-success">Free</span> : formateCurrency(shipping)}</dd></div>
            <div className="h-px bg-line" />
            <div className="flex justify-between text-base"><dt className="font-semibold">Total</dt><dd className="text-xl font-semibold">{formateCurrency(total)}</dd></div>
            <p className="text-right text-xs text-muted">Includes {formateCurrency(gst, 2)} GST ({gstPercent}%)</p>
          </dl>
          <Link href="/checkout" className="btn-primary mt-6 w-full py-3.5 text-base">
            Proceed to checkout <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted">
            <ShieldCheck className="h-3.5 w-3.5" /> Secure checkout powered by Razorpay
          </p>
        </aside>
      </div>
    </main>
  );
}
