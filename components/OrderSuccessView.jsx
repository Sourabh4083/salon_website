"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { site } from "@/lib/site";

export default function OrderSuccessView() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");

  useEffect(() => {
    clearCart();
    // Runs once on mount; clearCart is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="container-x py-16 sm:py-24">
      <div className="card mx-auto max-w-xl border-t-2 border-t-brand-2 p-8 text-center sm:p-12 animate-fade-up">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-success text-success">
          <Check className="h-7 w-7" />
        </span>
        <h1 className="mt-6 text-3xl font-medium sm:text-4xl">Order confirmed</h1>
        <p className="mt-3 text-muted">
          Thank you for shopping with {site.wordmark}. We are getting your order ready.
        </p>

        {orderId && (
          <p className="mt-6 text-sm">
            <span className="text-muted">Order number </span>
            <span className="font-mono font-semibold">#{orderId.slice(-8).toUpperCase()}</span>
          </p>
        )}

        <p className="mt-2 text-xs text-muted">You can follow its progress any time under My orders.</p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/my-orders" className="btn-primary">
            Track my order <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/#products" className="btn-outline">
            Continue shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
