"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SUITABLE_FOR } from "@/lib/catalog";

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name A-Z" },
];

export default function CatalogToolbar({ categories = [], colors = [], brands = [] }) {
  const router = useRouter();
  const params = useSearchParams();
  const category = (params.get("category") || "").toLowerCase();

  const update = (key, value) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page"); // any filter change resets pagination
    router.push(`/?${next.toString()}#products`, { scroll: false });
  };

  const selectClass = "input w-auto min-h-11 py-2 pr-9 text-sm";

  return (
    <div className="flex flex-col gap-3 border-y border-line py-3 lg:flex-row lg:items-center lg:justify-between">
      {/* Categories as one-tap chips: the first choice most customers make. */}
      {categories.length > 0 && (
        <div className="no-scrollbar -mx-4 flex min-w-0 gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0" role="group" aria-label="Category">
          {[{ value: "", label: "All" }, ...categories.map((c) => ({ value: c, label: c }))].map((c) => {
            const active = category === c.value.toLowerCase();
            return (
              <button
                key={c.label}
                onClick={() => update("category", c.value)}
                aria-pressed={active}
                className={`min-h-11 shrink-0 whitespace-nowrap border px-4 text-sm font-semibold transition-colors ${
                  active ? "border-ink bg-ink text-white" : "border-line bg-surface hover:border-ink"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
        <select
          value={params.get("suitableFor") || ""}
          onChange={(e) => update("suitableFor", e.target.value)}
          className={selectClass}
          aria-label="Filter by wig type"
        >
          <option value="">Any wig type</option>
          {SUITABLE_FOR.filter((h) => h !== "Both").map((h) => (
            <option key={h} value={h}>
              For {h.toLowerCase()}
            </option>
          ))}
        </select>

        {brands.length > 0 && (
          <select
            value={params.get("brand") || ""}
            onChange={(e) => update("brand", e.target.value)}
            className={selectClass}
            aria-label="Filter by brand"
          >
            <option value="">Any brand</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        )}

        {colors.length > 0 && (
          <select
            value={params.get("color") || ""}
            onChange={(e) => update("color", e.target.value)}
            className={selectClass}
            aria-label="Filter by colour"
          >
            <option value="">Any colour</option>
            {colors.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}

        <select
          value={params.get("sort") || "newest"}
          onChange={(e) => update("sort", e.target.value)}
          className={selectClass}
          aria-label="Sort products"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
