"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { HAIR_TYPES } from "@/lib/wig";

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name A-Z" },
];

const WEARERS = [
  { value: "", label: "All" },
  { value: "Men", label: "Men" },
  { value: "Women", label: "Women" },
];

export default function CatalogToolbar({ categories = [], colors = [] }) {
  const router = useRouter();
  const params = useSearchParams();
  const gender = (params.get("gender") || "").toLowerCase();

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
      {/* The first question every customer has, so it is a one-tap choice. */}
      <div className="flex gap-2" role="group" aria-label="Shop for">
        {WEARERS.map((w) => {
          const active = gender === w.value.toLowerCase();
          return (
            <button
              key={w.label}
              onClick={() => update("gender", w.value)}
              aria-pressed={active}
              className={`min-h-11 flex-1 border px-5 text-sm font-semibold transition-colors lg:flex-none ${
                active ? "border-ink bg-ink text-white" : "border-line bg-surface hover:border-ink"
              }`}
            >
              {w.label}
            </button>
          );
        })}
      </div>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
        <select
          value={params.get("hairType") || ""}
          onChange={(e) => update("hairType", e.target.value)}
          className={selectClass}
          aria-label="Filter by hair type"
        >
          <option value="">Any hair type</option>
          {HAIR_TYPES.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>

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

        {categories.length > 0 && (
          <select
            value={params.get("category") || ""}
            onChange={(e) => update("category", e.target.value)}
            className={selectClass}
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
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
          aria-label="Sort wigs"
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
