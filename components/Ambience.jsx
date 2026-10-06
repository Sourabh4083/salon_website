"use client";

import { useEffect, useRef } from "react";

// Same colours as --brand-2 and --brand-ink in app/globals.css.
const GOLD = "168, 132, 63";
const NAVY = "31, 58, 99";

// Three locks of fine strands that flow across the page. `y` and `tilt` are
// fractions of the viewport, `spread` is the gap between strands in pixels.
const TRESSES = [
  { y: 0.2, tilt: 0.16, strands: 9, spread: 15, color: GOLD, alpha: 0.42, amp: 64, speed: 0.1, phase: 0 },
  { y: 0.58, tilt: -0.12, strands: 7, spread: 21, color: NAVY, alpha: 0.13, amp: 84, speed: 0.07, phase: 2.1 },
  { y: 0.87, tilt: 0.08, strands: 8, spread: 13, color: GOLD, alpha: 0.32, amp: 52, speed: 0.13, phase: 4.4 },
];

const STEP = 22; // pixels between points on a strand
const REACH = 150; // how far from the pointer strands are pushed aside
const PUSH = 58; // how far they move
const IDLE_MS = 2500; // after this long without a pointer the light wanders by itself

// The page background, fixed behind everything: soft drifting light, fine
// strands that part around the pointer and ripple as the page scrolls, a pool
// of light that follows the pointer, and paper grain. On touch screens the
// light wanders by itself and moves to wherever the screen is touched.
// Purely decorative, so it is hidden from screen readers and never takes clicks.
export default function Ambience() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const spotRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const spot = spotRef.current;
    const ctx = canvas.getContext("2d");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");

    let w = 0;
    let h = 0;
    let strokes = [];
    let frame = 0;
    let lastMove = -Infinity;
    let scroll = window.scrollY;
    const target = { x: 0, y: 0 };
    const light = { x: 0, y: 0 };

    const resize = () => {
      w = wrap.clientWidth;
      h = wrap.clientHeight;
      // Phones get a lighter canvas; nothing here needs to be razor sharp.
      const dpr = Math.min(window.devicePixelRatio || 1, w < 768 ? 1.5 : 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineWidth = 1;
      // Each strand fades out towards both edges of the screen.
      strokes = TRESSES.map((t) => {
        const g = ctx.createLinearGradient(0, 0, w, 0);
        g.addColorStop(0, `rgba(${t.color}, 0)`);
        g.addColorStop(0.22, `rgba(${t.color}, ${t.alpha})`);
        g.addColorStop(0.78, `rgba(${t.color}, ${t.alpha})`);
        g.addColorStop(1, `rgba(${t.color}, 0)`);
        return g;
      });
      if (lastMove === -Infinity) {
        light.x = target.x = w * 0.7;
        light.y = target.y = h * 0.3;
      }
    };

    const draw = (time, react) => {
      ctx.clearRect(0, 0, w, h);
      // Narrow screens get a gentler wave so strands stay clear of each other.
      const scale = Math.max(0.55, Math.min(1, w / 1200));
      const roll = scroll * 0.0022;

      TRESSES.forEach((t, ti) => {
        ctx.strokeStyle = strokes[ti];
        const amp = t.amp * scale;
        const move = time * t.speed;
        for (let s = 0; s < t.strands; s++) {
          const off = s - (t.strands - 1) / 2;
          const phase = t.phase + off * 0.05 + roll;
          ctx.globalAlpha = 0.45 + 0.55 * (((s * 37 + ti * 11) % 10) / 9);
          ctx.beginPath();
          for (let x = -STEP; x <= w + STEP; x += STEP) {
            const u = x / w;
            // The lock pinches and fans out along its length.
            const fan = off * t.spread * scale * (0.7 + 0.3 * Math.sin(u * 5 + move * 2 + t.phase));
            let y =
              h * t.y +
              (u - 0.5) * w * t.tilt +
              amp * Math.sin(u * 6.9 + move + phase) +
              amp * 0.35 * Math.sin(u * 15 - move * 1.7 + phase * 2) +
              fan;
            if (react) {
              // Strands part around the pointer, like fingers through hair.
              const dx = x - light.x;
              const dy = y - light.y;
              y += (dy / REACH) * Math.exp(-(dx * dx + dy * dy) / (2 * REACH * REACH)) * PUSH;
            }
            if (x === -STEP) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      });
      ctx.globalAlpha = 1;
    };

    const placeSpot = () => {
      spot.style.transform = `translate3d(${light.x}px, ${light.y}px, 0) translate(-50%, -50%)`;
    };

    const tick = (now) => {
      frame = requestAnimationFrame(tick);
      const time = now / 1000;
      if (now - lastMove > IDLE_MS) {
        target.x = w * (0.5 + 0.32 * Math.sin(time * 0.21));
        target.y = h * (0.42 + 0.26 * Math.sin(time * 0.16 + 1.3));
      }
      light.x += (target.x - light.x) * 0.07;
      light.y += (target.y - light.y) * 0.07;
      scroll += (window.scrollY - scroll) * 0.08;
      placeSpot();
      draw(time, true);
    };

    const start = () => {
      cancelAnimationFrame(frame);
      if (still.matches) {
        // One calm, unmoving frame.
        scroll = 0;
        placeSpot();
        draw(0, false);
      } else if (!document.hidden) {
        frame = requestAnimationFrame(tick);
      }
    };

    const onPointer = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
      lastMove = performance.now();
    };

    const sizes = new ResizeObserver(() => {
      resize();
      start();
    });
    sizes.observe(wrap);

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });
    document.addEventListener("visibilitychange", start);
    still.addEventListener("change", start);

    return () => {
      cancelAnimationFrame(frame);
      sizes.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("visibilitychange", start);
      still.removeEventListener("change", start);
    };
  }, []);

  return (
    <div ref={wrapRef} className="ambience" aria-hidden="true">
      <span className="ambience-glow ambience-glow-1" />
      <span className="ambience-glow ambience-glow-2" />
      <span className="ambience-glow ambience-glow-3" />
      <span ref={spotRef} className="ambience-spot" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <span className="ambience-grain" />
    </div>
  );
}
