"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages }) {
  const params = useSearchParams();
  if (totalPages <= 1) return null;

  const href = (p) => {
    const next = new URLSearchParams(params.toString());
    if (p > 1) next.set("page", String(p));
    else next.delete("page");
    return `/?${next.toString()}#products`;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <Link
        href={href(page - 1)}
        aria-disabled={page <= 1}
        className={`grid h-11 w-11 place-items-center border border-line bg-white transition hover:border-brand ${
          page <= 1 ? "pointer-events-none opacity-40" : ""
        }`}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>

      {pages.map((p, i) => {
        const gap = i > 0 && p - pages[i - 1] > 1;
        return (
          <span key={p} className="flex items-center gap-1.5">
            {gap && <span className="px-1 text-muted">…</span>}
            <Link
              href={href(p)}
              aria-current={p === page ? "page" : undefined}
              className={`grid h-11 min-w-11 place-items-center px-3 text-sm font-semibold transition ${
                p === page
                  ? "bg-ink text-white"
                  : "border border-line bg-white hover:border-brand"
              }`}
            >
              {p}
            </Link>
          </span>
        );
      })}

      <Link
        href={href(page + 1)}
        aria-disabled={page >= totalPages}
        className={`grid h-11 w-11 place-items-center border border-line bg-white transition hover:border-brand ${
          page >= totalPages ? "pointer-events-none opacity-40" : ""
        }`}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
