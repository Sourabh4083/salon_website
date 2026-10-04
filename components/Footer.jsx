import Link from "next/link";
import { site, whatsappLink, phoneLink } from "@/lib/site";

export default function Footer({ categories = [], user = null }) {
  const wa = whatsappLink(`Hello ${site.wordmark}, I have a question.`);
  const tel = phoneLink();
  const hasVisit = site.address || site.hours.length > 0 || tel || wa;

  return (
    <footer className="mt-24 bg-ink text-white">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Link href="/" className="inline-block leading-none">
            <span className="display block text-3xl font-medium">{site.wordmark}</span>
            <span className="mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-2">
              {site.strapline}
            </span>
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/70">
            Wigs, hair patches and toppers for men and women, with fitting and styling at our salon.
          </p>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-2">Shop</p>
          <ul className="mt-4 space-y-2.5 text-sm text-white/75">
            <li><Link href="/?gender=Men#products" className="hover:text-white">Men&apos;s wigs</Link></li>
            <li><Link href="/?gender=Women#products" className="hover:text-white">Women&apos;s wigs</Link></li>
            <li><Link href="/#products" className="hover:text-white">All wigs</Link></li>
            {categories.slice(0, 4).map((c) => (
              <li key={c}>
                <Link href={`/?category=${encodeURIComponent(c)}#products`} className="hover:text-white">
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-2">Help</p>
          <ul className="mt-4 space-y-2.5 text-sm text-white/75">
            <li><Link href="/salon" className="hover:text-white">Salon services</Link></li>
            <li><Link href="/my-orders" className="hover:text-white">Track an order</Link></li>
            <li><Link href="/cart" className="hover:text-white">Cart</Link></li>
            {/* Sign-in and sign-up links only make sense for guests. */}
            {!user && (
              <>
                <li><Link href="/login" className="hover:text-white">Sign in</Link></li>
                <li><Link href="/register" className="hover:text-white">Create account</Link></li>
              </>
            )}
          </ul>
        </div>

        {hasVisit && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-2">Visit us</p>
            <div className="mt-4 space-y-3 text-sm text-white/75">
              {site.address && (
                <p className="whitespace-pre-line leading-relaxed">
                  {site.address}
                  {site.mapUrl && (
                    <>
                      <br />
                      <a href={site.mapUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-white">
                        Open in Maps
                      </a>
                    </>
                  )}
                </p>
              )}
              {site.hours.map((h) => (
                <p key={h.days}>
                  {h.days}: {h.time}
                </p>
              ))}
              {tel && (
                <p>
                  <a href={tel} className="hover:text-white">{site.phone}</a>
                </p>
              )}
              {wa && (
                <p>
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-white">
                    Chat on WhatsApp
                  </a>
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-white/15">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-6 text-xs text-white/60 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {site.name}
          </p>
          <p>
            GSTIN {site.gstin}
            <span className="mx-2 text-brand-2">|</span>
            Payments secured by Razorpay
          </p>
        </div>
      </div>
    </footer>
  );
}
