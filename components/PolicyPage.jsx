import Link from "next/link";
import { site, policies, phoneLink, whatsappLink } from "@/lib/site";

// Shared layout for the policy pages. `sections` is
// [{ title, body: [paragraph], list: [item] }]; paragraphs and items can be
// plain text or JSX.
export default function PolicyPage({ title, intro, updated, sections, current }) {
  const tel = phoneLink();
  const wa = whatsappLink(`Hello ${site.wordmark}, I have a question about your ${title.toLowerCase()}.`);

  return (
    <main className="container-x grid gap-12 py-12 sm:py-16 lg:grid-cols-[1fr_280px] lg:gap-20">
      <article className="max-w-2xl">
        <p className="eyebrow animate-fade-up">Policies</p>
        <h1 className="mt-3 text-4xl font-medium leading-tight sm:text-5xl animate-fade-up delay-100">{title}</h1>
        <span className="rule mt-6" />
        {intro && <p className="mt-6 text-base leading-relaxed text-muted sm:text-lg">{intro}</p>}

        {sections.map((section) => (
          <section key={section.title} className="mt-10">
            <h2 className="text-2xl font-medium">{section.title}</h2>
            {section.body?.map((paragraph, i) => (
              <p key={i} className="mt-3 leading-relaxed text-slate-700">
                {paragraph}
              </p>
            ))}
            {section.list && (
              <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-slate-700 marker:text-brand-2">
                {section.list.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <p className="mt-12 border-t border-line pt-5 text-sm text-muted">Last updated: {updated}</p>
      </article>

      <aside className="h-fit space-y-6 lg:sticky lg:top-40">
        <nav className="card p-6" aria-label="Policies">
          <p className="eyebrow">Policies</p>
          <ul className="mt-3 divide-y divide-line text-sm">
            {policies.map((p) => (
              <li key={p.href}>
                <Link
                  href={p.href}
                  aria-current={p.href === current ? "page" : undefined}
                  className={`block py-2.5 transition-colors hover:text-brand-ink ${
                    p.href === current ? "font-semibold" : "text-slate-700"
                  }`}
                >
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {(tel || wa) && (
          <div className="card p-6">
            <p className="eyebrow">Questions</p>
            <p className="mt-2 text-sm text-muted">Call or message us and we will help.</p>
            <div className="mt-4 flex flex-col gap-3">
              {tel && (
                <a href={tel} className="btn-primary">
                  Call {site.phone}
                </a>
              )}
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-outline">
                  Chat on WhatsApp
                </a>
              )}
            </div>
          </div>
        )}
      </aside>
    </main>
  );
}
