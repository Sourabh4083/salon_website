import { unstable_cache, revalidateTag } from "next/cache";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/dbConnect";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { DEFAULT_CATEGORIES } from "@/lib/catalog";

export const PRODUCTS_TAG = "products";
export const CATEGORIES_TAG = "categories";

// Production serves the catalog from Next's data cache. In development the
// database is read on every request instead: the local cache is not cleared
// when an admin changes products on the live site (same database), so it
// would keep showing deleted or outdated products.
const cached =
  process.env.NODE_ENV === "development"
    ? (fn) => fn
    : (fn, keyParts, options) => unstable_cache(fn, keyParts, options);
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
    brand: doc.brand ?? "",
    size: doc.size ?? "",
    suitableFor: doc.suitableFor ?? "",
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
export const getProducts = cached(
  async () => {
    await dbConnect();
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    return products.map(serialize);
  },
  ["products:list"],
  { tags: [PRODUCTS_TAG], revalidate: 300 }
);

/** One product by id, cached under the same tag. Returns null if missing. */
export const getProductById = cached(
  async (id) => {
    if (!mongoose.isValidObjectId(id)) return null;
    await dbConnect();
    const product = await Product.findById(id).lean();
    return serialize(product);
  },
  ["products:byId"],
  { tags: [PRODUCTS_TAG], revalidate: 300 }
);

/**
 * Creates the starter categories when there are none at all. Safe to call on
 * every read: once any category exists it does nothing, and a duplicate from
 * two requests racing is ignored.
 */
export async function ensureDefaultCategories() {
  await dbConnect();
  if (await Category.estimatedDocumentCount()) return;
  try {
    await Category.insertMany(
      DEFAULT_CATEGORIES.map((name, order) => ({ name, order })),
      { ordered: false }
    );
  } catch (err) {
    if (err?.code !== 11000) throw err;
  }
}

/** Every category the admin has made, in display order. */
export const getAllCategories = cached(
  async () => {
    await ensureDefaultCategories();
    const rows = await Category.find().sort({ order: 1, name: 1 }).lean();
    return rows.map((c) => ({ _id: String(c._id), name: c.name, order: c.order ?? 0 }));
  },
  ["categories:list"],
  { tags: [CATEGORIES_TAG], revalidate: 300 }
);

/**
 * Category names for the storefront, in the admin's order. Only categories
 * that have at least one product are listed, so no link opens an empty page.
 */
export async function getCategories() {
  const [categories, products] = await Promise.all([getAllCategories(), getProducts()]);
  const used = new Set(products.map((p) => (p.category || "").trim().toLowerCase()));
  return categories.map((c) => c.name).filter((name) => used.has(name.toLowerCase()));
}

/**
 * Values customers can filter by, taken from what is actually in the
 * catalog so no filter option ever leads to an empty page.
 */
export async function getFacets() {
  const products = await getProducts();
  // Admin types colour and brand as free text; "black" and "Black" are one option.
  const distinct = (field) => {
    const seen = new Map();
    for (const p of products) {
      const value = (p[field] || "").trim();
      if (value && !seen.has(value.toLowerCase())) seen.set(value.toLowerCase(), value);
    }
    return [...seen.values()].sort((a, b) => a.localeCompare(b));
  };
  return { colors: distinct("color"), brands: distinct("brand") };
}

/** A product marked "Both" suits human hair and synthetic wigs alike. */
function matchesSuitableFor(product, wanted) {
  const own = product.suitableFor.toLowerCase();
  const w = wanted.toLowerCase();
  return own === w || (own === "both" && w !== "both");
}

/**
 * Filters the cached catalog in memory. The catalog is small enough that
 * this is faster than a round trip to the database, and it keeps the
 * homepage fully cache-served.
 */
export async function searchProducts({
  q = "",
  category = "",
  brand = "",
  suitableFor = "",
  color = "",
  sort = "newest",
  page = 1,
  pageSize = PAGE_SIZE,
} = {}) {
  let items = await getProducts();

  const needle = q.trim().toLowerCase();
  if (needle) {
    items = items.filter((p) =>
      [p.title, p.description, p.category, p.brand, p.size, p.color].some(
        (field) => field.toLowerCase().includes(needle)
      )
    );
  }

  if (category) {
    const c = category.toLowerCase();
    items = items.filter((p) => p.category.toLowerCase() === c);
  }

  if (brand) {
    const b = brand.trim().toLowerCase();
    items = items.filter((p) => p.brand.trim().toLowerCase() === b);
  }

  if (suitableFor) {
    items = items.filter((p) => matchesSuitableFor(p, suitableFor));
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

/** Up to `limit` other products, same category and brand first, then newest. */
export async function getRelatedProducts(product, limit = 4) {
  const all = await getProducts();
  const others = all.filter((p) => p._id !== product._id);
  const score = (p) =>
    (product.category && p.category === product.category ? 2 : 0) +
    (product.brand && p.brand === product.brand ? 1 : 0);
  // Array.prototype.sort is stable, so equal scores stay newest-first.
  return [...others].sort((a, b) => score(b) - score(a)).slice(0, limit);
}

/** Call after any admin create/update/delete so readers see it immediately. */
export function revalidateProducts() {
  revalidateTag(PRODUCTS_TAG);
}

/** Call after any admin category create/rename/delete. */
export function revalidateCategories() {
  revalidateTag(CATEGORIES_TAG);
}
