import Image from "next/image";
import Link from "next/link";
import { site, whatsappLink, phoneLink } from "@/lib/site";
import { formateCurrency } from "@/utils/formatCurrency";
import ShopGallery from "@/components/ShopGallery";
import ShopMap from "@/components/ShopMap";
import Reveal from "@/components/Reveal";

export const metadata = {
  title: "Unisex salon",
  description: `Wig fitting, styling, haircuts and grooming at ${site.name}.`,
};

function ServiceRow({ service }) {
  const wa = whatsappLink(`Hello ${site.wordmark}, I would like to book: ${service.name}.`);
  return (
    <li className="flex items-baseline gap-3 py-3.5 transition-[padding,background-color] duration-200 hover:bg-surface hover:px-3">
      <span className="font-medium">{service.name}</span>
      {service.duration && <span className="text-xs text-muted">{service.duration}</span>}
      {/* Dotted leader, like a printed menu */}
      <span className="mx-1 flex-1 border-b border-dotted border-slate-300" aria-hidden="true" />
      <span className="text-sm">
        {service.price != null ? formateCurrency(service.price) : "On request"}
      </span>
      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="link text-sm"
          aria-label={`Book ${service.name} on WhatsApp`}
        >
          Book
        </a>
      )}
    </li>
  );
}

export default function SalonPage() {
  const wa = whatsappLink(`Hello ${site.wordmark}, I would like to book a salon appointment.`);
  const tel = phoneLink();

  return (
    <main>
      <section className="border-b border-line">
        <div className="container-x grid items-center gap-10 py-10 md:grid-cols-2 md:gap-16 md:py-16">
          <div>
            <p className="eyebrow animate-fade-up">Unisex salon</p>
            <h1 className="mt-4 text-5xl font-medium leading-[1.05] sm:text-6xl animate-fade-up delay-100">
              Fitted, cut
              <br />
              <em className="font-normal">and styled.</em>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted sm:text-lg animate-fade-up delay-200">
              A wig looks natural when it is fitted to you. Visit us for a consultation, a
              fitting, or simply a good haircut. Men and women are both welcome.
            </p>
            {(wa || tel) && (
              <div className="mt-8 flex flex-col gap-3 sm:flex-row animate-fade-up delay-300">
                {wa && (
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-primary px-7">
                    Book on WhatsApp
                  </a>
                )}
                {tel && (
                  <a href={tel} className="btn-outline px-7">
                    Call {site.phone}
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="group relative aspect-[4/5] overflow-hidden bg-ink md:aspect-[4/5]">
            {site.images.salon ? (
              <Image
                src={site.images.salon}
                alt="Inside the Blue Heaven salon"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center">
                <p className="display text-4xl italic text-white/25">The Salon</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="container-x grid gap-12 pt-16 lg:grid-cols-[1.6fr_1fr] lg:gap-20">
        {/* Service menu */}
        <div>
          <p className="eyebrow">Menu</p>
          <h2 className="mt-2 text-3xl font-medium sm:text-4xl">Services</h2>
          <div className="mt-8 space-y-10">
            {site.salonServices.map((group) => (
              <Reveal key={group.group}>
                <h3 className="text-xl font-medium">{group.group}</h3>
                <ul className="mt-2 divide-y divide-line border-y border-line">
                  {group.items.map((service) => (
                    <ServiceRow key={service.name} service={service} />
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Visit */}
        <aside className="h-fit border border-line bg-surface p-7 lg:sticky lg:top-40">
          <h2 className="text-2xl font-medium">Visit us</h2>

          {site.address && (
            <div className="mt-5">
              <p className="eyebrow">Address</p>
              <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed">{site.address}</p>
              {site.mapUrl && (
                <a href={site.mapUrl} target="_blank" rel="noopener noreferrer" className="link mt-2 inline-block text-sm">
                  Open in Maps
                </a>
              )}
            </div>
          )}

          {site.hours.length > 0 && (
            <div className="mt-5">
              <p className="eyebrow">Hours</p>
              <dl className="mt-1.5 text-sm">
                {site.hours.map((h) => (
                  <div key={h.days} className="flex justify-between gap-4 py-1">
                    <dt>{h.days}</dt>
                    <dd className="text-muted">{h.time}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {(wa || tel) && (
            <div className="mt-6 grid gap-3">
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-primary">
                  Book on WhatsApp
                </a>
              )}
              {tel && (
                <a href={tel} className="btn-outline">
                  Call {site.phone}
                </a>
              )}
            </div>
          )}

          {!site.address && site.hours.length === 0 && !wa && !tel && (
            <p className="mt-4 text-sm text-muted">Address and booking details will be added here shortly.</p>
          )}

          <p className="mt-6 border-t border-line pt-5 text-sm text-muted">
            Looking for a wig first?{" "}
            <Link href="/#products" className="link">
              Browse the collection
            </Link>
          </p>
        </aside>
      </section>

      <section className="container-x pt-20 sm:pt-24">
        <Reveal>
          <p className="eyebrow">Gallery</p>
          <h2 className="mt-2 text-3xl font-medium sm:text-4xl">Inside the salon</h2>
        </Reveal>
        <ShopGallery photos={site.gallery.filter((photo) => photo.salon)} />
      </section>

      {site.mapEmbed && (
        <Reveal as="section" className="container-x pt-20 sm:pt-24">
          <p className="eyebrow">Visit</p>
          <h2 className="mt-2 text-3xl font-medium sm:text-4xl">Find us</h2>
          <ShopMap className="mt-8 aspect-[4/3] sm:aspect-[21/9]" />
        </Reveal>
      )}
    </main>
  );
}
