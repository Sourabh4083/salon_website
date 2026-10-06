import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import CategoryTiles from "@/components/CategoryTiles";
import CatalogToolbar from "@/components/CatalogToolbar";
import Pagination from "@/components/Pagination";
import ShopGallery from "@/components/ShopGallery";
import ShopMap from "@/components/ShopMap";
import HeroShowcase from "@/components/HeroShowcase";
import Marquee from "@/components/Marquee";
import Reveal from "@/components/Reveal";
import { getCategories, getFacets, getProducts, searchProducts, matchesGender } from "@/lib/products";
import { getCurrentUser } from "@/lib/auth";
import { site, whatsappLink, phoneLink } from "@/lib/site";
import { formateCurrency } from "@/utils/formatCurrency";
import { GENDERS, HAIR_TYPES } from "@/lib/wig";

export const metadata = {
  title: { absolute: `${site.name} | ${site.tagline}` },
};

// A photo if there is one, otherwise a quiet typographic panel so the
// layout never shows an empty grey box.
function Frame({ src, alt, sizes, priority = false, label, className = "" }) {
  return (
    <div className={`relative overflow-hidden bg-ink ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center p-6 text-center">
          <p className="display text-3xl italic text-white/25 sm:text-4xl">{label}</p>
        </div>
      )}
    </div>
  );
}

function WearerPanels({ men, women }) {
  const panels = [
    { title: "For him", sub: "Men's wigs and hair patches", href: "/?gender=Men#products", src: men },
    { title: "For her", sub: "Women's wigs and toppers", href: "/?gender=Women#products", src: women },
  ];
  return (
    <section className="container-x pt-16 sm:pt-20">
      <div className="grid gap-5 sm:grid-cols-2">
        {panels.map((p, i) => (
          <Reveal key={p.title} delay={i * 120}>
            <Link href={p.href} className="group block">
              <div className="relative overflow-hidden">
                <Frame
                  src={p.src}
                  alt=""
                  sizes="(max-width: 640px) 100vw, 50vw"
                  label={p.title}
                  className="aspect-[4/3] sm:aspect-[4/5] lg:aspect-[5/4]"
                />
                {/* Slides up on hover; always visible on touch screens. */}
                <span className="shop-now absolute bottom-0 left-0 bg-ink px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                  Shop now
                </span>
              </div>
              <div className="mt-4 flex items-end justify-between gap-4 border-b border-line pb-4 transition-colors group-hover:border-ink">
                <div>
                  <h2 className="text-2xl font-medium sm:text-3xl">{p.title}</h2>
                  <p className="mt-1 text-sm text-muted">{p.sub}</p>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function SalonTeaser({ image }) {
  const wa = whatsappLink(`Hello ${site.wordmark}, I would like to book a salon appointment.`);
  const services = site.salonServices.flatMap((g) => g.items).slice(0, 5);
  return (
    <Reveal as="section" className="container-x pt-20 sm:pt-24">
      <div className="group grid border border-line bg-surface md:grid-cols-2">
        <Frame
          src={image}
          alt="Inside the Blue Heaven salon"
          sizes="(max-width: 768px) 100vw, 50vw"
          label="The Salon"
          className="aspect-[4/3] md:aspect-auto md:min-h-[420px]"
        />
        <div className="p-7 sm:p-12">
          <p className="eyebrow">Unisex salon</p>
          <h2 className="mt-3 text-3xl font-medium sm:text-4xl">Fitted and styled in person</h2>
          <p className="mt-4 max-w-md text-muted">
            Bring your wig in, or choose one with us. We cut, fit and style it so it sits
            naturally, and look after your own hair too.
          </p>
          <ul className="mt-6 divide-y divide-line border-y border-line text-sm">
            {services.map((s) => (
              <li key={s.name} className="py-2.5 transition-[padding,color] duration-200 hover:pl-2 hover:text-brand-ink">
                {s.name}
              </li>
            ))}
          </ul>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:*:whitespace-nowrap">
            <Link href="/salon" className="btn-primary">
              See all services
            </Link>
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-outline">
                Book on WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function FindUs() {
  if (!site.mapEmbed) return null;
  const tel = phoneLink();
  return (
    <Reveal as="section" className="container-x pt-20 sm:pt-24">
      <p className="eyebrow">Visit</p>
      <h2 className="mt-2 text-3xl font-medium sm:text-4xl">Find us</h2>
      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_2fr] md:gap-12">
        <div className="text-sm">
          {site.address && (
            <>
              <p className="eyebrow">Address</p>
              <p className="mt-1.5 whitespace-pre-line leading-relaxed">{site.address}</p>
            </>
          )}
          {site.hours.length > 0 && (
            <>
              <p className="eyebrow mt-5">Hours</p>
              {site.hours.map((h) => (
                <p key={h.days} className="mt-1.5">
                  {h.days}, {h.time}
                </p>
              ))}
            </>
          )}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row md:flex-col">
            {site.mapUrl && (
              <a href={site.mapUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                Get directions
              </a>
            )}
            {tel && (
              <a href={tel} className="btn-outline">
                Call {site.phone}
              </a>
            )}
          </div>
        </div>
        <ShopMap className="aspect-[4/3] md:aspect-auto md:min-h-[400px]" />
      </div>
    </Reveal>
  );
}

// Shown only to visitors who are not signed in.
function JoinStrip() {
  return (
    <Reveal as="section" className="container-x pt-20">
      <div className="flex flex-col items-start justify-between gap-5 border-y border-line py-8 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-medium">Create an account</h2>
          <p className="mt-1 text-sm text-muted">Track your orders and check out faster next time.</p>
        </div>
        <Link href="/register" className="btn-outline group">
          Join free <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </Reveal>
  );
}

// Accept only values the catalog actually knows, so a hand-typed URL
// cannot put arbitrary text into the heading.
const known = (list, value) =>
  list.find((item) => item.toLowerCase() === String(value || "").toLowerCase()) || "";

export default async function Home({ searchParams }) {
  const sp = await searchParams;
  const q = typeof sp?.q === "string" ? sp.q : "";
  const category = typeof sp?.category === "string" ? sp.category : "";
  const gender = known(GENDERS, sp?.gender);
  const hairType = known(HAIR_TYPES, sp?.hairType);
  const sort = typeof sp?.sort === "string" ? sp.sort : "newest";
  const page = Number(sp?.page) || 1;

  const { colors } = await getFacets();
  const color = known(colors, sp?.color);

  const [result, categories, all, user] = await Promise.all([
    searchProducts({ q, category, gender, hairType, color, sort, page }),
    getCategories(),
    getProducts(),
    getCurrentUser(),
  ]);
  const isGuest = !user;
  const isFiltering = Boolean(q || category || gender || hairType || color);

  // Newest product photo for a wearer, until real photos are set in lib/site.js.
  const newestFor = (g) => all.find((p) => p.image && matchesGender(p, g))?.image || "";
  const images = {
    hero: site.images.hero || all.find((p) => p.image)?.image || "",
    men: site.images.men || newestFor("Men"),
    women: site.images.women || newestFor("Women"),
    salon: site.images.salon,
  };

  // One hero photo per distinct picture, so a fallback never shows twice.
  const slides = [
    { key: "all", label: "The collection", src: images.hero, alt: "A wig from the Blue Heaven collection" },
    { key: "men", label: "For him", src: images.men, alt: "A men's wig from the Blue Heaven collection" },
    { key: "women", label: "For her", src: images.women, alt: "A women's wig from the Blue Heaven collection" },
  ].filter((slide, i, list) => slide.src && list.findIndex((s) => s.src === slide.src) === i);

  // Short facts for the scrolling line under the hero, all taken from lib/site.js.
  const facts = [
    "Human hair and synthetic wigs",
    "Hair patches and toppers",
    "For men and women",
    "Fitted and styled in our salon",
    `Free delivery over ${formateCurrency(site.shipping.freeAt)}`,
    ...site.hours.map((h) => `Open ${h.days.toLowerCase()}, ${h.time}`),
  ];

  const heading = q
    ? `Results for “${q}”`
    : gender === "Men"
      ? "Men's wigs"
      : gender === "Women"
        ? "Women's wigs"
        : category || "The collection";

  return (
    <main>
      <HeroShowcase slides={slides} />
      <Marquee items={facts} />
      <WearerPanels men={images.men} women={images.women} />

      {categories.length > 0 && (
        <Reveal as="section" className="container-x pt-20 sm:pt-24">
          <p className="eyebrow">Browse</p>
          <h2 className="mt-2 text-3xl font-medium sm:text-4xl">Shop by category</h2>
          <CategoryTiles categories={categories} products={all} active={category} />
        </Reveal>
      )}

      {/* Catalog */}
      <section id="products" className="container-x scroll-mt-40 pt-20 sm:pt-24">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">{[hairType, color].filter(Boolean).join(" · ") || "Wigs"}</p>
            <h2 className="mt-2 text-3xl font-medium capitalize sm:text-4xl">{heading}</h2>
          </div>
          <p className="text-sm text-muted">
            {result.total} {result.total === 1 ? "style" : "styles"}
            {isFiltering && (
              <>
                {" · "}
                <Link href="/#products" className="link">
                  Clear filters
                </Link>
              </>
            )}
          </p>
        </div>

        <div className="mt-6">
          <CatalogToolbar categories={categories} colors={colors} />
        </div>

        {result.items.length === 0 ? (
          <div className="mt-10 border border-line bg-surface px-6 py-16 text-center">
            <h3 className="text-2xl font-medium">
              {all.length === 0 ? "The collection is being prepared" : "Nothing matched that"}
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
              {all.length === 0
                ? "Our wigs will appear here soon. Meanwhile, the salon is open for consultations."
                : "Try a different word, or clear the filters to see everything."}
            </p>
            <Link href={all.length === 0 ? "/salon" : "/#products"} className="btn-primary mt-6">
              {all.length === 0 ? "Visit the salon" : "See all wigs"}
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4">
            {result.items.map((product, index) => (
              <Reveal key={product._id} delay={(index % 4) * 70}>
                <ProductCard product={product} priority={index < 4} />
              </Reveal>
            ))}
          </div>
        )}

        <Pagination page={result.page} totalPages={result.totalPages} />
      </section>

      <SalonTeaser image={images.salon} />

      <section className="container-x pt-20 sm:pt-24">
        <Reveal>
          <p className="eyebrow">Gallery</p>
          <h2 className="mt-2 text-3xl font-medium sm:text-4xl">Inside Blue Heaven</h2>
        </Reveal>
        <ShopGallery photos={site.gallery} />
      </section>

      <FindUs />

      {isGuest && <JoinStrip />}
    </main>
  );
}
