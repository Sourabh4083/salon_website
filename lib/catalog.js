// Option lists for product attributes. The product model, the admin form and
// the storefront filters all read from here so they cannot drift apart.

// Which kind of wig a care product or accessory is meant for.
export const SUITABLE_FOR = ["Human hair", "Synthetic", "Both"];
export const MAX_IMAGES = 6;

// Created the first time the categories are read and none exist yet. After
// that the admin adds, renames and deletes them from Admin > Categories.
export const DEFAULT_CATEGORIES = [
  "Shampoo & conditioner",
  "Adhesives & tapes",
  "Caps, stands & tools",
  "Styling & care",
];

const text = (v, max = 200) => String(v ?? "").trim().slice(0, max);

/** Trims a category name and collapses inner spaces. Empty means invalid. */
export const cleanCategoryName = (v) => String(v ?? "").trim().replace(/\s+/g, " ").slice(0, 60);

/** Matches a name exactly but ignoring case, so "Shampoo" and "shampoo" are one. */
export const sameNameRegex = (name) =>
  new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
const oneOf = (list, v) => (list.includes(v) ? v : "");

/**
 * Whitelists and coerces a product payload from the admin form. Used by both
 * create and update so the two routes always accept the same fields.
 *
 * Returns { error } on invalid input, otherwise { data }.
 */
export function pickProductFields(body) {
  const title = text(body?.title);
  const price = Number(body?.price);
  const mrp = Number(body?.mrp);
  const stock = Math.floor(Number(body?.stock));

  if (!title) return { error: "Title is required" };
  if (!Number.isFinite(price) || price <= 0) return { error: "Enter a valid price" };

  const images = (Array.isArray(body?.images) ? body.images : [])
    .filter((u) => typeof u === "string" && u.trim())
    .map((u) => u.trim())
    .slice(0, MAX_IMAGES);
  if (images.length === 0 && typeof body?.image === "string" && body.image.trim()) {
    images.push(body.image.trim());
  }

  return {
    data: {
      title,
      description: text(body?.description, 4000),
      price,
      // Only kept when it is a real, higher list price.
      mrp: Number.isFinite(mrp) && mrp > price ? mrp : 0,
      stock: Number.isFinite(stock) && stock > 0 ? stock : 0,
      category: text(body?.category, 60),
      brand: text(body?.brand, 60),
      size: text(body?.size, 40),
      suitableFor: oneOf(SUITABLE_FOR, body?.suitableFor),
      color: text(body?.color, 40),
      images,
      // Primary photo; the cart, orders and thumbnails read this field.
      image: images[0] || "",
    },
  };
}
