import ShopMap from "@/components/ShopMap";
import { site, whatsappLink, phoneLink } from "@/lib/site";

export const metadata = {
  title: "Contact us",
  description: `Phone, WhatsApp, address and opening hours for ${site.name}.`,
};

export default function ContactPage() {
  const tel = phoneLink();
  const wa = whatsappLink(`Hello ${site.wordmark}, I have a question.`);

  return (
    <main className="container-x py-12 sm:py-16">
      <p className="eyebrow animate-fade-up">Contact</p>
      <h1 className="mt-3 text-4xl font-medium leading-tight sm:text-5xl animate-fade-up delay-100">Contact us</h1>
      <span className="rule mt-6" />
      <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
        Questions about a wig, an order or a salon appointment? Call, message or visit us.
      </p>

      <div className="mt-10 grid gap-8 md:grid-cols-[1fr_1.4fr] md:gap-12">
        <div className="card h-fit p-7 text-sm">
          <h2 className="text-2xl font-medium">{site.name}</h2>

          {site.address && (
            <div className="mt-5">
              <p className="eyebrow">Address</p>
              <p className="mt-1.5 whitespace-pre-line leading-relaxed">{site.address}</p>
            </div>
          )}

          {tel && (
            <div className="mt-5">
              <p className="eyebrow">Phone and WhatsApp</p>
              <p className="mt-1.5">
                <a href={tel} className="link">
                  {site.phone}
                </a>
              </p>
            </div>
          )}

          {site.hours.length > 0 && (
            <div className="mt-5">
              <p className="eyebrow">Hours</p>
              {site.hours.map((h) => (
                <p key={h.days} className="mt-1.5">
                  {h.days}, {h.time}
                </p>
              ))}
            </div>
          )}

          {site.gstin && (
            <div className="mt-5">
              <p className="eyebrow">GSTIN</p>
              <p className="mt-1.5">{site.gstin}</p>
            </div>
          )}

          <div className="mt-7 flex flex-col gap-3">
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
            {site.mapUrl && (
              <a href={site.mapUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                Get directions
              </a>
            )}
          </div>
        </div>

        <ShopMap className="aspect-[4/3] md:aspect-auto md:min-h-[460px]" />
      </div>
    </main>
  );
}
