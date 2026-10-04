"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { LogoBadge } from "@/components/Logo";
import { site } from "@/lib/site";

const ROTATE_MS = 4500;

// Home page hero. The photo changes on its own, when a tab under it is
// pressed, and when a pointer rests on one of the two shop buttons.
// `slides` is [{ key, label, src, alt }]; the keys "men" and "women" are the
// ones the buttons look for.
export default function HeroShowcase({ slides }) {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const paused = useRef(false);

  useEffect(() => {
    if (!auto || slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      if (!paused.current) setActive((i) => (i + 1) % slides.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [auto, slides.length]);

  const pause = (value) => () => {
    paused.current = value;
  };

  // Preview a wearer's photo while their button is hovered or focused.
  const preview = (key) => ({
    onMouseEnter: () => {
      const i = slides.findIndex((s) => s.key === key);
      if (i >= 0) setActive(i);
      paused.current = true;
    },
    onMouseLeave: pause(false),
    onFocus: () => {
      const i = slides.findIndex((s) => s.key === key);
      if (i >= 0) setActive(i);
    },
  });

  return (
    <section className="border-b border-line">
      <div className="container-x grid items-center gap-10 py-10 md:grid-cols-[1fr_0.9fr] md:gap-16 md:py-16">
        <div className="order-2 md:order-1">
          <p className="eyebrow animate-fade-up">{site.strapline}</p>
          <h1 className="mt-4 text-[2.6rem] font-medium leading-[1.05] sm:text-6xl lg:text-7xl animate-fade-up delay-100">
            Hair that looks
            <br />
            <em className="font-normal">like your own.</em>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted sm:text-lg animate-fade-up delay-200">
            Wigs, hair patches and toppers for men and women. Choose online, or visit
            the salon and we will fit and style it for you.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row animate-fade-up delay-300">
            <Link href="/?gender=Men#products" className="btn-primary group px-7" {...preview("men")}>
              Shop men&apos;s wigs
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/?gender=Women#products" className="btn-outline group px-7" {...preview("women")}>
              Shop women&apos;s wigs
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        <div className="relative order-1 md:order-2">
          <div
            className="relative aspect-[4/5] overflow-hidden bg-ink"
            onMouseEnter={pause(true)}
            onMouseLeave={pause(false)}
          >
            {slides.length === 0 && (
              <div className="absolute inset-0 grid place-items-center p-6 text-center">
                <p className="display text-3xl italic text-white/25 sm:text-4xl">{site.wordmark}</p>
              </div>
            )}
            {slides.map((slide, i) => (
              <Image
                key={slide.key}
                src={slide.src}
                alt={i === active ? slide.alt : ""}
                fill
                sizes="(max-width: 768px) 100vw, 45vw"
                priority={i === 0}
                className={`hero-slide object-cover ${i === active ? "is-active" : ""}`}
              />
            ))}
          </div>

          <LogoBadge
            priority
            sizes="(max-width: 768px) 80px, 128px"
            className="animate-float pointer-events-none absolute -left-2 -top-4 h-auto w-20 drop-shadow-[0_6px_14px_rgba(20,35,59,0.28)] md:-left-10 md:top-8 md:w-32"
          />

          {slides.length > 1 && (
            <div className="mt-3 flex gap-3" role="group" aria-label="Choose a photo">
              {slides.map((slide, i) => (
                <button
                  key={slide.key}
                  type="button"
                  onClick={() => {
                    setActive(i);
                    setAuto(false);
                  }}
                  aria-pressed={i === active}
                  className={`min-h-11 flex-1 border-t-2 pt-2 text-left text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                    i === active ? "border-ink text-ink" : "border-line text-muted hover:border-brand-2 hover:text-ink"
                  }`}
                >
                  {slide.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
