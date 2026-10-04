import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import ProductActions from "@/components/ProductActions";
import ProductGallery from "@/components/ProductGallery";
import ProductCard from "@/components/ProductCard";
import { formateCurrency } from "@/utils/formatCurrency";
import { getProductById, getRelatedProducts } from "@/lib/products";
import { site, gstPercent, whatsappLink } from "@/lib/site";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return { title: "Wig not found" };
  return {
    title: product.title,
    description: product.description || `${product.title} from ${site.shortName}.`,
    openGraph: product.image ? { images: [product.image] } : undefined,
  };
}

export default async function ProductDetail({ params }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const related = await getRelatedProducts(product, 4);
  const hasMrp = product.mrp > product.price;
  const off = hasMrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  const specs = [
    ["For", product.gender],
    ["Hair type", product.hairType],
    ["Base", product.baseType],
    ["Length", product.length],
    ["Colour", product.color],
    ["Category", product.category],
  ].filter(([, value]) => value);

  const notes = [
    `Free delivery on orders over ${formateCurrency(site.shipping.freeAt)}`,
    site.deliveryText,
    site.returnsText,
    "Secure payment by UPI, card or netbanking through Razorpay",
  ].filter(Boolean);

  const enquiryHref = whatsappLink(
    `Hello ${site.wordmark}, I am interested in "${product.title}" (${site.url}/product/${product._id}).`
  );

  return (
    <main className="container-x pb-28 pt-6 sm:pt-10 md:pb-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-ink">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        {product.gender && product.gender !== "Unisex" ? (
          <>
            <Link href={`/?gender=${product.gender}#products`} className="hover:text-ink">
              {product.gender}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
          </>
        ) : null}
        <span className="truncate text-ink">{product.title}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} title={product.title} soldOut={product.stock <= 0} />

        {/* Info */}
        <div>
          <p className="eyebrow">
            {[product.gender, product.hairType].filter(Boolean).join(" · ") || "Wig"}
          </p>
          <h1 className="mt-3 text-3xl font-medium leading-tight sm:text-5xl">{product.title}</h1>

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <p className="text-2xl font-semibold sm:text-3xl">{formateCurrency(product.price)}</p>
            {hasMrp && (
              <>
                <p className="text-lg text-muted line-through">{formateCurrency(product.mrp)}</p>
                <span className="pill border border-accent text-accent">
                  Save {formateCurrency(product.mrp - product.price)} ({off}% off)
                </span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-muted">Inclusive of {gstPercent}% GST</p>

          {product.description && (
            <p className="mt-6 whitespace-pre-line text-[15px] leading-relaxed text-slate-700">
              {product.description}
            </p>
          )}

          <div className="mt-8">
            <ProductActions product={product} enquiryHref={enquiryHref} />
          </div>

          {specs.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xl font-medium">Details</h2>
              <dl className="mt-3 divide-y divide-line border-y border-line text-sm">
                {specs.map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-6 py-3">
                    <dt className="text-muted">{label}</dt>
                    <dd className="text-right font-medium capitalize">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <ul className="mt-8 space-y-2 text-sm text-muted">
            {notes.map((note) => (
              <li key={note} className="flex gap-3">
                <span className="mt-2.5 h-px w-4 shrink-0 bg-brand-2" />
                {note}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-20 border-t border-line pt-12">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-medium sm:text-3xl">You may also like</h2>
            <Link href="/#products" className="link text-sm">
              View all
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
