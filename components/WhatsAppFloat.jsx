"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { site, whatsappLink } from "@/lib/site";

// Quick way to ask a question from any page. Renders nothing until a
// WhatsApp number is set in lib/site.js.
export default function WhatsAppFloat() {
  const pathname = usePathname();
  const href = whatsappLink(`Hello ${site.wordmark}, I have a question.`);

  if (!href || pathname.startsWith("/admin") || pathname.startsWith("/checkout")) return null;

  // The product page has a sticky add-to-cart bar on mobile; sit above it.
  const onProduct = pathname.startsWith("/product/");

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className={`fixed right-4 z-40 flex h-12 items-center gap-2 rounded-full bg-[#1f7a4d] px-4 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-[#19653f] md:bottom-6 md:right-6 ${
        onProduct ? "bottom-24" : "bottom-5"
      }`}
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
