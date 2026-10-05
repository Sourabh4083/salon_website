"use client";

import { useEffect, useState } from "react";
import { formateCurrency } from "@/utils/formatCurrency";
import { gstPercent } from "@/lib/site";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/admin/orders");
        const data = await res.json();

        if (res.ok && Array.isArray(data)) {
          setOrders(data);
        } else {
          console.error("Invalid data received from API:", data);
          setOrders([]);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        setOrders([]);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="container-x py-10">
      <p className="eyebrow">Admin</p>
      <h1 className="mt-2 text-4xl font-medium">Customer orders</h1>

      {orders === null ? (
        <p className="mt-8 text-muted">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="card mt-8 p-8 text-center text-muted">No orders yet.</p>
      ) : (
        <div className="mt-8 space-y-5">
          {orders.map((order) => (
            <article key={order._id} className="card p-5 sm:p-6">
              <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
                <p className="font-mono text-sm font-semibold">#{String(order._id).slice(-8).toUpperCase()}</p>
                <p className="text-sm text-muted">{new Date(order.createdAt).toLocaleString("en-IN")}</p>
              </header>

              <div className="mt-4 grid gap-6 text-sm sm:grid-cols-3">
                <div className="min-w-0 break-words">
                  <p className="eyebrow">Customer</p>
                  <p className="mt-1.5 font-medium">{order.userInfo?.name}</p>
                  {order.userInfo?.phone && (
                    <p>
                      <a href={`tel:+91${order.userInfo.phone}`} className="link">{order.userInfo.phone}</a>
                    </p>
                  )}
                  {/* Older orders were placed with an email instead of a mobile number. */}
                  {order.userInfo?.email && <p className="text-muted">{order.userInfo.email}</p>}
                  <p className="mt-1 whitespace-pre-line text-muted">{order.userInfo?.address}</p>
                </div>

                <div>
                  <p className="eyebrow">Items</p>
                  <ul className="mt-1.5 space-y-1">
                    {order.cartItem.map((item, i) => (
                      <li key={i}>
                        {item?.title || "Unnamed product"} × {item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="eyebrow">Payment</p>
                  <dl className="mt-1.5 space-y-1">
                    {/* Orders placed before the GST breakup was stored only have a total. */}
                    {order.taxableAmount != null && (
                      <>
                        <div className="flex justify-between"><dt className="text-muted">Taxable value</dt><dd>{formateCurrency(order.taxableAmount, 2)}</dd></div>
                        <div className="flex justify-between"><dt className="text-muted">GST ({gstPercent}%)</dt><dd>{formateCurrency(order.gstAmount, 2)}</dd></div>
                        <div className="flex justify-between"><dt className="text-muted">Of which delivery</dt><dd>{formateCurrency(order.shippingAmount || 0)}</dd></div>
                      </>
                    )}
                    <div className="flex justify-between font-semibold"><dt>Total</dt><dd>{formateCurrency(order.totalAmount)}</dd></div>
                  </dl>
                  <p className="mt-2 capitalize text-muted">
                    {order.paymentStatus} · {order.deliveryStatus || "pending"}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
