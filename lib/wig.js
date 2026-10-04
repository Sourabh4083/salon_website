// Option lists for wig attributes. The product model, the admin form and the
// storefront filters all read from here so they cannot drift apart.

export const GENDERS = ["Men", "Women", "Unisex"];
export const HAIR_TYPES = ["Human hair", "Synthetic", "Blend"];
export const BASE_TYPES = [
  "Lace front",
  "Full lace",
  "Monofilament",
  "Skin / PU base",
  "Clip-on",
  "Hair patch",
];
export const LENGTHS = ["Short", "Medium", "Long"];
export const MAX_IMAGES = 6;

const text = (v, max = 200) => String(v ?? "").trim().slice(0, max);
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
      gender: oneOf(GENDERS, body?.gender),
      hairType: oneOf(HAIR_TYPES, body?.hairType),
      baseType: oneOf(BASE_TYPES, body?.baseType),
      length: text(body?.length, 40),
      color: text(body?.color, 40),
      images,
      // Primary photo; the cart, orders and thumbnails read this field.
      image: images[0] || "",
    },
  };
}
