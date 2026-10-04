import { formateCurrency } from "@/utils/formatCurrency";
import Link from "next/link";
import Image from "next/image";
import QuickAddButton from "@/components/QuickAddButton";

// Matches the grid in app/page.js: 2 / 3 / 4 columns.
const CARD_SIZES =
  "(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw";

export default function ProductCard({ product, priority = false }) {
  const lowStock = product.stock > 0 && product.stock <= 5;
  const soldOut = product.stock <= 0;
  const hasMrp = product.mrp > product.price;
  // For example "Women · Human hair"
  const attributes = [product.gender, product.hairType].filter(Boolean).join(" · ");

  return (
    <article className="group flex flex-col">
      {/* Portrait frame: wigs read better tall than square. */}
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
        <Link href={`/product/${product._id}`} prefetch className="absolute inset-0" tabIndex={-1} aria-hidden="true">
          {product.image ? (
            <Image
              src={product.image}
              alt=""
              fill
              sizes={CARD_SIZES}
              priority={priority}
              className={`object-cover transition duration-700 group-hover:scale-[1.03] ${soldOut ? "opacity-60 grayscale" : ""}`}
            />
          ) : null}
        </Link>

        <div className="pointer-events-none absolute left-0 top-3 flex flex-col items-start gap-1">
          {soldOut && <span className="pill bg-ink text-white">Sold out</span>}
          {lowStock && <span className="pill bg-surface text-accent">Only {product.stock} left</span>}
        </div>

        <QuickAddButton product={product} />
      </div>

      <div className="pt-3">
        {attributes && <p className="eyebrow">{attributes}</p>}
        <h3 className="mt-1 text-base font-medium leading-snug sm:text-lg">
          <Link href={`/product/${product._id}`} className="line-clamp-2 hover:text-brand-ink">
            {product.title}
          </Link>
        </h3>
        <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2 text-sm">
          <span className="font-semibold">{formateCurrency(product.price)}</span>
          {hasMrp && <span className="text-muted line-through">{formateCurrency(product.mrp)}</span>}
        </p>
      </div>
    </article>
  );
}
