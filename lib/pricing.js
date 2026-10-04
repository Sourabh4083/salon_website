import Product from "@/models/Product";
import { orderTotals } from "@/lib/totals";
import { site } from "@/lib/site";

/**
 * Re-prices a client-supplied cart against the database.
 *
 * The browser is never trusted for prices or totals: it only tells us which
 * product ids and quantities it wants. Everything charged is read back from
 * the Product collection here.
 *
 * Returns { error } on invalid input, otherwise { items, totalAmount } plus
 * the breakup of that total (subtotal, delivery, taxable value, GST).
 */
export async function priceCart(cartItem) {
  if (!Array.isArray(cartItem) || cartItem.length === 0) {
    return { error: "Cart is empty" };
  }

  // Collapse duplicate lines for the same product and validate quantities.
  const quantities = new Map();
  for (const item of cartItem) {
    const id = item?._id ?? item?.product;
    if (!id) return { error: "Invalid cart item" };

    const quantity = Number(item?.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
      return { error: "Invalid quantity" };
    }

    quantities.set(String(id), (quantities.get(String(id)) || 0) + quantity);
  }

  const ids = [...quantities.keys()];
  const products = await Product.find({ _id: { $in: ids } })
    .select("title price image stock")
    .lean();

  if (products.length !== ids.length) {
    return { error: "One or more products are no longer available" };
  }

  const items = [];
  let subtotal = 0;

  for (const product of products) {
    const quantity = quantities.get(String(product._id));

    if (product.stock < quantity) {
      return { error: `Not enough stock for ${product.title}` };
    }

    items.push({
      product: product._id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity,
    });

    subtotal += product.price * quantity;
  }

  const totals = orderTotals(subtotal);

  return {
    items,
    subtotal: totals.subtotal,
    shippingAmount: totals.shipping,
    taxableAmount: totals.taxable,
    gstAmount: totals.gst,
    gstRate: site.gstRate,
    // Delivery is part of what is charged, not just what is displayed.
    totalAmount: totals.total,
  };
}