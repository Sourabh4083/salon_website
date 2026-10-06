"use client";

import { useState } from "react";
import Image from "next/image";

// Main photo with thumbnails. With a single photo it is just the photo.
export default function ProductGallery({ images, title, soldOut = false }) {
  const [active, setActive] = useState(0);
  const current = images[active] || images[0];

  return (
    // min-w-0 lets the thumbnail row scroll instead of widening the page.
    <div className="min-w-0 lg:sticky lg:top-40 lg:self-start">
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
        {current ? (
          <Image
            key={current}
            src={current}
            alt={title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className={`object-cover ${soldOut ? "opacity-70 grayscale" : ""}`}
          />
        ) : null}
      </div>

      {images.length > 1 && (
        <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1} of ${images.length}`}
              aria-current={i === active}
              className={`relative aspect-[4/5] w-20 shrink-0 overflow-hidden border bg-slate-100 transition-colors ${
                i === active ? "border-ink" : "border-transparent hover:border-line"
              }`}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
