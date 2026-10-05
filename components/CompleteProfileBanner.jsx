"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, X } from "lucide-react";
import { useCart } from "@/context/CartContext";

const HIDDEN_ON = ["/profile", "/admin", "/login", "/register"];

// Sign-up only asks for name, username, mobile and password, so this nudges signed-in
// customers to fill in the rest. Closing it lasts for the browser session.
export default function CompleteProfileBanner() {
  const { user } = useCart();
  const pathname = usePathname();
  // Start hidden so a dismissed bar never flashes before storage is read.
  const [dismissed, setDismissed] = useState(true);

  const key = user ? `profileBannerDismissed:${user.id}` : null;

  useEffect(() => {
    if (!key) return;
    try {
      setDismissed(sessionStorage.getItem(key) === "1");
    } catch {
      setDismissed(false);
    }
  }, [key]);

  if (!user || user.profileComplete || dismissed) return null;
  if (HIDDEN_ON.some((route) => pathname.startsWith(route))) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(key, "1");
    } catch {
      /* storage unavailable: hidden until the next page load */
    }
  };

  return (
    <div className="border-b border-line bg-surface animate-fade-in" role="status">
      <div className="container-x flex items-center gap-3 py-2.5 text-sm">
        <span className="h-8 w-0.5 shrink-0 bg-brand-2" aria-hidden="true" />
        <p className="min-w-0 flex-1">
          <span className="font-semibold">Complete your profile</span>
          <span className="text-muted"> to check out faster next time.</span>
        </p>
        <Link href="/profile" className="link inline-flex shrink-0 items-center gap-1 whitespace-nowrap">
          Complete profile <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <button
          onClick={dismiss}
          className="-mr-2 grid h-9 w-9 shrink-0 place-items-center text-muted hover:text-ink"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
