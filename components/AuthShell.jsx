import Link from "next/link";
import { site } from "@/lib/site";

const BENEFITS = [
  "Track every order in one place",
  "Check out faster next time",
  "Your cart is saved across devices",
];

// Shared two-panel layout for login and register.
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <main className="container-x py-10 sm:py-16">
      <div className="card mx-auto grid max-w-5xl overflow-hidden lg:grid-cols-[1fr_1.1fr]">
        {/* Brand panel */}
        <div className="hidden flex-col justify-between bg-ink p-10 text-white lg:flex">
          <Link href="/" className="leading-none">
            <span className="display block text-3xl font-medium">{site.wordmark}</span>
            <span className="mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-2">
              {site.strapline}
            </span>
          </Link>
          <div>
            <p className="display text-4xl font-medium leading-tight">
              Hair that looks
              <br />
              <em className="font-normal">like your own.</em>
            </p>
            <ul className="mt-8 divide-y divide-white/15 border-y border-white/15 text-sm text-white/80">
              {BENEFITS.map((b) => (
                <li key={b} className="py-3">
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-white/50">GSTIN {site.gstin}</p>
        </div>

        {/* Form panel */}
        <div className="p-6 sm:p-10">
          <h1 className="text-3xl font-medium sm:text-4xl">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
        </div>
      </div>
    </main>
  );
}
