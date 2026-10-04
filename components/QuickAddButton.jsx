"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "@/context/CartContext";

// Full-width bar along the bottom of a product card photo.
export default function QuickAddButton({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  if (product.stock <= 0) return null;

  const onClick = () => {
    addToCart(product, 1);
    setAdded(true);
    toast.success(`${product.title} added to cart`);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <button
      onClick={onClick}
      aria-label={`Add ${product.title} to cart`}
      className={`quick-add absolute inset-x-0 bottom-0 flex min-h-11 items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors ${
        added ? "bg-success" : "bg-ink/90 hover:bg-ink"
      }`}
    >
      {added ? (
        <>
          <Check className="h-4 w-4" /> Added
        </>
      ) : (
        "Add to cart"
      )}
    </button>
  );
}
