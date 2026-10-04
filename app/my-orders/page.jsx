import Link from "next/link";
import { Package, ArrowRight, CheckCircle2, Clock, Truck, Home, XCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { dbConnect } from "@/lib/dbConnect";
import Order from "@/models/Order";
import { formateCurrency } from "@/utils/formatCurrency";
import { site, gstPercent } from "@/lib/site";

export const metadata = { title: "My orders" };

const STEPS = ["pending", "shipped", "delivered"];
const STEP_META = {
  pending: { label: "Order placed", icon: Clock },
  shipped: { label: "Shipped", icon: Truck },
  delivered: { label: "Delivered", icon: Home },
};

function StatusTimeline({ status }) {
  if (status === "cancelled") {
    return (
      <p className="flex items-center gap-2 text-sm font-medium text-red-600">
        <XCircle className="h-4 w-4" /> Order cancelled
      </p>
    );
  }
  const idx = STEPS.indexOf(status);
  return (
    <ol className="flex items-center">
      {STEPS.map((s, i) => {
        const { label, icon: Icon } = STEP_META[s];
        const done = i <= idx;
        return (
          <li key={s} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <span className={`grid h-8 w-8 place-items-center rounded-full ${done ? "bg-brand text-white" : "bg-slate-100 text-slate-400"}`}>
                <Icon className="h-4 w-4" />
              </span>
              <span className={`mt-1.5 whitespace-nowrap text-[11px] font-medium ${done ? "text-ink" : "text-muted"}`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`mx-2 mb-5 h-0.5 flex-1 rounded ${i < idx ? "bg-brand" : "bg-slate-200"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default async function MyOrdersPage() {
  await dbConnect();
  const user = await getCurrentUser();

  if (!user) {
    return (
      <main className="container-x py-20 text-center">
        <h1 className="text-2xl font-medium">Sign in to see your orders</h1>
        <Link href="/login?redirect=/my-orders" className="btn-primary mt-6">Sign in</Link>
      </main>
    );
  }

  const orders = await Order.find({ user: user.id }).sort({ createdAt: -1 }).lean();

  if (orders.length === 0) {
    return (
      <main className="container-x py-20">
        <div className="card mx-auto flex max-w-lg flex-col items-center gap-4 px-6 py-16 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand/10 text-brand-ink">
            <Package className="h-7 w-7" />
          </span>
          <h1 className="text-2xl font-medium">No orders yet</h1>
          <p className="max-w-sm text-sm text-muted">When you place an order it will show up here with its delivery status.</p>
          <Link href="/#products" className="btn-primary mt-2">Start shopping <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container-x py-8 sm:py-12">
      <h1 className="text-3xl font-medium">My orders</h1>
      <p className="mt-1 text-sm text-muted">{orders.length} {orders.length === 1 ? "order" : "orders"}</p>

      <div className="mt-8 space-y-6">
        {orders.map((order) => {
          const id = String(order._id);
          return (
            <article key={id} className="card overflow-hidden">
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-slate-50/60 px-5 py-4">
                <div className="flex flex-wrap gap-6 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted">Order</p>
                    <p className="font-mono font-semibold">#{id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted">Placed on</p>
                    <p className="font-medium">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted">Total</p>
                    <p className="font-semibold">{formateCurrency(order.totalAmount)}</p>
                  </div>
                </div>
                <span className={`pill border ${order.paymentStatus === "paid" ? "border-success text-success" : "border-accent text-accent"}`}>
                  <CheckCircle2 className="h-3.5 w-3.5" /> {order.paymentStatus === "paid" ? "Paid" : "Payment pending"}
                </span>
              </header>

              <div className="grid gap-6 p-5 md:grid-cols-[1fr_320px]">
                <div>
                <ul className="divide-y divide-line">
                  {order.cartItem.map((item, i) => (
                    <li key={i} className="flex items-center justify-between gap-4 py-3 text-sm">
                      <div className="min-w-0">
                        <Link href={`/product/${item.product}`} className="line-clamp-1 font-medium hover:text-brand-ink">
                          {item.title}
                        </Link>
                        <p className="text-xs text-muted">Qty {item.quantity} × {formateCurrency(item.price)}</p>
                      </div>
                      <p className="font-semibold">{formateCurrency(item.price * item.quantity)}</p>
                    </li>
                  ))}
                </ul>
                {/* Orders placed before the GST breakup was stored only have a total. */}
                {order.taxableAmount != null && (
                  <dl className="mt-3 space-y-1 border-t border-line pt-3 text-xs text-muted">
                    <div className="flex justify-between"><dt>Delivery</dt><dd>{order.shippingAmount ? formateCurrency(order.shippingAmount) : "Free"}</dd></div>
                    <div className="flex justify-between"><dt>Taxable value</dt><dd>{formateCurrency(order.taxableAmount, 2)}</dd></div>
                    <div className="flex justify-between"><dt>GST ({gstPercent}%) included</dt><dd>{formateCurrency(order.gstAmount, 2)}</dd></div>
                    <div className="flex justify-between"><dt>Seller GSTIN</dt><dd>{site.gstin}</dd></div>
                  </dl>
                )}
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">Delivery status</p>
                  <StatusTimeline status={order.deliveryStatus || "pending"} />
                  {order.userInfo?.address && (
                    <p className="mt-4 text-xs text-muted">
                      <span className="font-semibold text-slate-700">Ship to:</span> {order.userInfo.address}
                    </p>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
