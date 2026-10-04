import Link from "next/link";
import Image from "next/image";

// One tile per category, using the newest product image in that category
// as its cover so tiles stay fresh without any extra admin work.
export default function CategoryTiles({ categories, products, active = "" }) {
  const cover = (c) =>
    products.find((p) => p.category?.toLowerCase() === c.toLowerCase() && p.image)?.image;
  const count = (c) =>
    products.filter((p) => p.category?.toLowerCase() === c.toLowerCase()).length;

  return (
    <div className="no-scrollbar -mx-4 mt-8 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-4 xl:grid-cols-6">
      {categories.map((c) => {
        const img = cover(c);
        const isActive = active.toLowerCase() === c.toLowerCase();
        const n = count(c);
        return (
          <Link
            key={c}
            href={`/?category=${encodeURIComponent(c)}#products`}
            className="group w-36 shrink-0 sm:w-auto"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
              {img && (
                <Image
                  src={img}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 144px, (max-width: 1280px) 25vw, 16vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.03]"
                />
              )}
            </div>
            <p
              className={`mt-3 border-b pb-1 text-sm font-semibold capitalize transition-colors group-hover:border-brand-2 ${
                isActive ? "border-brand-2" : "border-transparent"
              }`}
            >
              {c}
            </p>
            <p className="mt-1 text-xs text-muted">
              {n} {n === 1 ? "style" : "styles"}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
