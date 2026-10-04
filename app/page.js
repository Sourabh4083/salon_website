import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import CategoryTiles from "@/components/CategoryTiles";
import CatalogToolbar from "@/components/CatalogToolbar";
import Pagination from "@/components/Pagination";
import { getCategories, getFacets, getProducts, searchProducts, matchesGender } from "@/lib/products";
import { getCurrentUser } from "@/lib/auth";
import { site, whatsappLink } from "@/lib/site";
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
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <div className="absolute inset-0 grid place-items-center p-6 text-center">
          <p className="display text-3xl italic text-white/25 sm:text-4xl">{label}</p>
        </div>
      )}
    </div>
  );
}

function Hero({ image }) {
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
            <Link href="/?gender=Men#products" className="btn-primary px-7">
              Shop men&apos;s wigs
            </Link>
            <Link href="/?gender=Women#products" className="btn-outline px-7">
              Shop women&apos;s wigs
            </Link>
          </div>
        </div>

        <Frame
          src={image}
          alt="A wig from the Blue Heaven collection"
          sizes="(max-width: 768px) 100vw, 45vw"
          priority
          label={site.wordmark}
          className="order-1 aspect-[4/5] md:order-2"
        />
      </div>
    </section>
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
        {panels.map((p) => (
          <Link key={p.title} href={p.href} className="group block">
            <Frame
              src={p.src}
              alt=""
              sizes="(max-width: 640px) 100vw, 50vw"
              label={p.title}
              className="aspect-[4/3] sm:aspect-[4/5] lg:aspect-[5/4]"
            />
            <div className="mt-4 flex items-end justify-between gap-4 border-b border-line pb-4 transition-colors group-hover:border-ink">
              <div>
                <h2 className="text-2xl font-medium sm:text-3xl">{p.title}</h2>
                <p className="mt-1 text-sm text-muted">{p.sub}</p>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function SalonTeaser({ image }) {
  const wa = whatsappLink(`Hello ${site.wordmark}, I would like to book a salon appointment.`);
  const services = site.salonServices.flatMap((g) => g.items).slice(0, 5);
  return (
    <section className="container-x pt-20 sm:pt-24">
      <div className="grid border border-line bg-surface md:grid-cols-2">
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
              <li key={s.name} className="py-2.5">
                {s.name}
              </li>
            ))}
          </ul>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
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
    </section>
  );
}

// Shown only to visitors who are not signed in.
function JoinStrip() {
  return (
    <section className="container-x pt-20">
      <div className="flex flex-col items-start justify-between gap-5 border-y border-line py-8 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-medium">Create an account</h2>
          <p className="mt-1 text-sm text-muted">Track your orders and check out faster next time.</p>
        </div>
        <Link href="/register" className="btn-outline">
          Join free <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
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

  const heading = q
    ? `Results for “${q}”`
    : gender === "Men"
      ? "Men's wigs"
      : gender === "Women"
        ? "Women's wigs"
        : category || "The collection";

  return (
    <main>
      <Hero image={images.hero} />
      <WearerPanels men={images.men} women={images.women} />

      {categories.length > 0 && (
        <section className="container-x pt-20 sm:pt-24">
          <p className="eyebrow">Browse</p>
          <h2 className="mt-2 text-3xl font-medium sm:text-4xl">Shop by category</h2>
          <CategoryTiles categories={categories} products={all} active={category} />
        </section>
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
              <ProductCard key={product._id} product={product} priority={index < 4} />
            ))}
          </div>
        )}

        <Pagination page={result.page} totalPages={result.totalPages} />
      </section>

      <SalonTeaser image={images.salon} />

      {isGuest && <JoinStrip />}
    </main>
  );
}
