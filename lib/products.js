import { unstable_cache, revalidateTag } from "next/cache";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/dbConnect";
import Product from "@/models/Product";

export const PRODUCTS_TAG = "products";
export const PAGE_SIZE = 12;

// Mongoose documents carry ObjectIds and Dates, which do not survive the
// cache's JSON round-trip cleanly. Flatten to plain serialisable objects.
function serialize(doc) {
  if (!doc) return null;
  const images = Array.isArray(doc.images) ? doc.images.filter(Boolean) : [];
  const image = doc.image || images[0] || "";
  return {
    _id: String(doc._id),
    title: doc.title,
    description: doc.description ?? "",
    price: doc.price,
    mrp: doc.mrp ?? 0,
    image,
    images: images.length > 0 ? images : image ? [image] : [],
    category: doc.category ?? "",
    gender: doc.gender ?? "",
    hairType: doc.hairType ?? "",
    baseType: doc.baseType ?? "",
    length: doc.length ?? "",
    color: doc.color ?? "",
    stock: doc.stock ?? 0,
    slug: doc.slug ?? "",
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
  };
}

/**
 * Full catalog, newest first. Served from Next's data cache and only
 * re-fetched when an admin writes a product (see revalidateProducts) or
 * after the revalidate window as a safety net.
 */
export const getProducts = unstable_cache(
  async () => {
    await dbConnect();
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    return products.map(serialize);
  },
  ["products:list"],
  { tags: [PRODUCTS_TAG], revalidate: 300 }
);

/** One product by id, cached under the same tag. Returns null if missing. */
export const getProductById = unstable_cache(
  async (id) => {
    if (!mongoose.isValidObjectId(id)) return null;
    await dbConnect();
    const product = await Product.findById(id).lean();
    return serialize(product);
  },
  ["products:byId"],
  { tags: [PRODUCTS_TAG], revalidate: 300 }
);

/** Distinct, non-empty category names, alphabetical. */
export async function getCategories() {
  const products = await getProducts();
  const set = new Set(
    products.map((p) => (p.category || "").trim()).filter(Boolean)
  );
  return [...set].sort((a, b) => a.localeCompare(b));
}

/**
 * Values customers can filter by, taken from what is actually in the
 * catalog so no filter option ever leads to an empty page.
 */
export async function getFacets() {
  const products = await getProducts();
  const colors = new Map();
  for (const p of products) {
    const color = (p.color || "").trim();
    // Admin types colour as free text; "black" and "Black" are one option.
    if (color && !colors.has(color.toLowerCase())) colors.set(color.toLowerCase(), color);
  }
  return {
    colors: [...colors.values()].sort((a, b) => a.localeCompare(b)),
  };
}

/** A wig marked Unisex belongs in both the men's and the women's listing. */
export function matchesGender(product, gender) {
  if (!gender) return true;
  const wanted = gender.toLowerCase();
  const own = product.gender.toLowerCase();
  return own === wanted || (own === "unisex" && wanted !== "unisex");
}

/**
 * Filters the cached catalog in memory. The catalog is small enough that
 * this is faster than a round trip to the database, and it keeps the
 * homepage fully cache-served.
 */
export async function searchProducts({
  q = "",
  category = "",
  gender = "",
  hairType = "",
  color = "",
  sort = "newest",
  page = 1,
  pageSize = PAGE_SIZE,
} = {}) {
  let items = await getProducts();

  const needle = q.trim().toLowerCase();
  if (needle) {
    items = items.filter((p) =>
      [p.title, p.description, p.category, p.gender, p.hairType, p.baseType, p.color, p.length].some(
        (field) => field.toLowerCase().includes(needle)
      )
    );
  }

  if (category) {
    const c = category.toLowerCase();
    items = items.filter((p) => p.category.toLowerCase() === c);
  }

  if (gender) {
    items = items.filter((p) => matchesGender(p, gender));
  }

  if (hairType) {
    const h = hairType.toLowerCase();
    items = items.filter((p) => p.hairType.toLowerCase() === h);
  }

  if (color) {
    const c = color.trim().toLowerCase();
    items = items.filter((p) => p.color.trim().toLowerCase() === c);
  }

  const sorters = {
    newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    name: (a, b) => a.title.localeCompare(b.title),
  };
  items = [...items].sort(sorters[sort] || sorters.newest);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, Number(page) || 1), totalPages);
  const start = (current - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    total,
    page: current,
    totalPages,
  };
}

/** Up to `limit` other products, same wearer and category first, then newest. */
export async function getRelatedProducts(product, limit = 4) {
  const all = await getProducts();
  const others = all.filter((p) => p._id !== product._id);
  const score = (p) =>
    (product.gender && p.gender === product.gender ? 2 : 0) +
    (product.category && p.category === product.category ? 1 : 0);
  // Array.prototype.sort is stable, so equal scores stay newest-first.
  return [...others].sort((a, b) => score(b) - score(a)).slice(0, limit);
}

/** Call after any admin create/update/delete so readers see it immediately. */
export function revalidateProducts() {
  revalidateTag(PRODUCTS_TAG);
}
