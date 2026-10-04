"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import Reveal from "@/components/Reveal";

// Full-screen viewer. Arrow keys and swipes move between photos, Escape closes.
function Lightbox({ photos, index, onClose, onStep }) {
  const closeRef = useRef(null);
  const touchX = useRef(null);
  const photo = photos[index];

  useEffect(() => {
    const opener = document.activeElement;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onStep(1);
      if (e.key === "ArrowLeft") onStep(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      opener?.focus?.();
    };
  }, [onClose, onStep]);

  const stop = (e) => e.stopPropagation();
  const arrow =
    "grid h-11 w-11 shrink-0 place-items-center border border-white/30 text-white transition-colors hover:bg-white hover:text-ink";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      className="animate-fade-in fixed inset-0 z-[60] flex flex-col bg-ink/95 text-white"
      onClick={onClose}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 50) onStep(dx < 0 ? 1 : -1);
      }}
    >
      <div className="container-x flex items-center justify-between py-3" onClick={stop}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
          {index + 1} / {photos.length}
        </p>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close photo viewer" className={arrow}>
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 items-center gap-2 px-2 sm:gap-4 sm:px-6">
        <button type="button" onClick={(e) => { stop(e); onStep(-1); }} aria-label="Previous photo" className={`${arrow} hidden sm:grid`}>
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="relative h-full flex-1">
          <Image key={photo.src} src={photo.src} alt={photo.alt} fill sizes="100vw" className="animate-fade-in object-contain" />
        </div>
        <button type="button" onClick={(e) => { stop(e); onStep(1); }} aria-label="Next photo" className={`${arrow} hidden sm:grid`}>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <p className="container-x py-4 text-center text-sm text-white/80" onClick={stop}>
        {photo.alt}
      </p>
    </div>,
    document.body
  );
}

// Photos of the shop itself, laid out at their own proportions so nothing
// is cropped. These are never mixed into the product catalog. Pressing a
// photo opens it full screen.
export default function ShopGallery({ photos }) {
  const [open, setOpen] = useState(null);
  const count = photos?.length || 0;

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (by) => setOpen((i) => (i == null ? i : (i + by + count) % count)),
    [count]
  );

  if (!count) return null;
  return (
    <>
      <div className="mt-8 columns-2 gap-4 md:columns-3 sm:gap-5">
        {photos.map((photo, i) => (
          <Reveal key={photo.src} delay={(i % 3) * 80} className="mb-4 break-inside-avoid sm:mb-5">
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`View photo: ${photo.alt}`}
              className="group relative block w-full overflow-hidden bg-slate-100"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                sizes="(max-width: 768px) 50vw, 33vw"
                className="h-auto w-full transition duration-700 group-hover:scale-105"
              />
              <span className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-between gap-3 bg-ink/90 px-3 py-2.5 text-left text-xs text-white transition-transform duration-300 group-hover:translate-y-0 group-focus-visible:translate-y-0">
                <span className="line-clamp-1">{photo.alt}</span>
                <Expand className="h-4 w-4 shrink-0" />
              </span>
            </button>
          </Reveal>
        ))}
      </div>
      {open != null && <Lightbox photos={photos} index={open} onClose={close} onStep={step} />}
    </>
  );
}
