import { site } from "@/lib/site";

// Pure money maths shared by the server (what is charged) and the browser
// (what is shown), so the two can never disagree.

const round2 = (n) => Math.round(n * 100) / 100;

/** Delivery fee for a cart subtotal. */
export function shippingFor(subtotal) {
  if (subtotal <= 0) return 0;
  return subtotal >= site.shipping.freeAt ? 0 : site.shipping.fee;
}

/** Splits a GST-inclusive amount into taxable value and GST. */
export function gstBreakup(amount) {
  const taxable = round2(amount / (1 + site.gstRate));
  return { taxable, gst: round2(amount - taxable) };
}

/**
 * Prices include GST, so the customer pays subtotal + delivery and the tax
 * is reported as a breakup of that total.
 */
export function orderTotals(subtotal) {
  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;
  return { subtotal, shipping, total, ...gstBreakup(total) };
}
