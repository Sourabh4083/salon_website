"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Re-renders the current server page in place (no reload, scroll kept) so
// status changes made by the shop show up on their own: every `intervalMs`
// while the tab is visible, and straight away when the customer comes back
// to the tab.
export default function AutoRefresh({ intervalMs = 60000 }) {
  const router = useRouter();

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const timer = setInterval(refresh, intervalMs);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router, intervalMs]);

  return null;
}
