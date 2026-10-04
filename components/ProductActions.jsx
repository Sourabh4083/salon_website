"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { formateCurrency } from "@/utils/formatCurrency";

// The only interactive part of the product page. Everything else renders
// on the server so the page arrives already filled in.
export default function ProductActions({ product, enquiryHref = null }) {
  const { addToCart } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const max = Math.min(100, Math.max(1, product.stock));
  const outOfStock = product.stock <= 0;

  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => Math.min(max, q + 1));

  const handleAdd = () => {
    addToCart(product, qty);
    toast.success(`Added ${qty} × ${product.title}`);
  };

  const handleBuyNow = () => {
    addToCart(product, qty);
    router.push("/checkout");
  };

  if (outOfStock) {
    return (
      <div className="border border-line bg-surface p-5">
        <p className="font-semibold">Currently sold out</p>
        <p className="mt-1 text-sm text-muted">
          {enquiryHref
            ? "Message us and we will tell you when it is back, or suggest something similar."
            : "Please check back soon, or browse similar styles below."}
        </p>
        {enquiryHref && (
          <a href={enquiryHref} target="_blank" rel="noopener noreferrer" className="btn-outline mt-4">
            Ask on WhatsApp
          </a>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center border border-line bg-surface">
            <button onClick={dec} className="grid h-11 w-11 place-items-center hover:bg-slate-100" aria-label="Decrease quantity">
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="number"
              min={1}
              max={max}
              value={qty}
              onChange={(e) => setQty(Math.min(max, Math.max(1, Number(e.target.value) || 1)))}
              className="h-11 w-14 border-x border-line bg-transparent text-center text-sm font-semibold focus:outline-none"
              aria-label="Quantity"
            />
            <button onClick={inc} className="grid h-11 w-11 place-items-center hover:bg-slate-100" aria-label="Increase quantity">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm">
            {product.stock <= 5 ? (
              <span className="font-semibold text-accent">Only {product.stock} left</span>
            ) : (
              <span className="font-medium text-success">In stock</span>
            )}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button onClick={handleAdd} className="btn-primary flex-1 py-3.5 text-base">
            Add to cart
          </button>
          <button onClick={handleBuyNow} className="btn-outline flex-1 py-3.5 text-base">
            Buy now
          </button>
        </div>

        {enquiryHref && (
          <p className="text-sm text-muted">
            Not sure about colour or size?{" "}
            <a href={enquiryHref} target="_blank" rel="noopener noreferrer" className="link">
              Ask about this wig on WhatsApp
            </a>
          </p>
        )}
      </div>

      {/* Mobile: keep the buy button in reach while reading the page. */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-4 border-t border-line bg-bg px-4 py-3 md:hidden">
        <div className="min-w-0">
          <p className="truncate text-xs text-muted">{product.title}</p>
          <p className="font-semibold">{formateCurrency(product.price * qty)}</p>
        </div>
        <button onClick={handleAdd} className="btn-primary ml-auto shrink-0 px-6">
          Add to cart
        </button>
      </div>
    </>
  );
}
