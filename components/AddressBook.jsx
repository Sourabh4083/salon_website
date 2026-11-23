"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { MapPin, Plus, Pencil, Trash2, Star } from "lucide-react";
import AddressForm from "@/components/AddressForm";
import { addressLines, MAX_ADDRESSES } from "@/lib/address";
import { useCart } from "@/context/CartContext";

/** Name, address lines and phone of one saved address. */
export function AddressText({ address }) {
  return (
    <div className="min-w-0 text-sm">
      <p className="flex flex-wrap items-center gap-2 font-medium">
        {address.name}
        <span className="pill border border-line text-[10px] uppercase tracking-wider text-muted">
          {address.type === "work" ? "Work" : "Home"}
        </span>
        {address.isDefault && (
          <span className="pill border border-brand-2 text-[10px] uppercase tracking-wider">Default</span>
        )}
      </p>
      {addressLines(address).map((line) => (
        <p key={line} className="break-words text-muted">{line}</p>
      ))}
      <p className="mt-0.5 text-muted">
        Mobile: {address.phone}{address.altPhone ? ` / ${address.altPhone}` : ""}
      </p>
    </div>
  );
}

export async function sendAddress(url, method, body) {
  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { error: data.error || "Something went wrong", field: data.field };
    return data;
  } catch {
    return { error: "Network error. Please try again." };
  }
}

// Saved delivery addresses on the account page: add, edit, remove, default.
export default function AddressBook({ initialAddresses, legacyAddress, defaults }) {
  const router = useRouter();
  const { refreshUser } = useCart();
  const [addresses, setAddresses] = useState(initialAddresses);
  // null | "new" | an address id
  const [editing, setEditing] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const applied = async (data, message) => {
    setAddresses(data.addresses);
    setEditing(null);
    toast.success(message);
    // The "complete your profile" checklist and banner depend on having one.
    await refreshUser?.();
    router.refresh();
  };

  const add = async (address) => {
    const data = await sendAddress("/api/addresses", "POST", address);
    if (data.error) return data;
    await applied(data, "Address saved");
  };

  const update = (id) => async (address) => {
    const data = await sendAddress(`/api/addresses/${id}`, "PUT", address);
    if (data.error) return data;
    await applied(data, "Address updated");
  };

  const makeDefault = async (id) => {
    setBusyId(id);
    const data = await sendAddress(`/api/addresses/${id}`, "PUT", { makeDefault: true });
    setBusyId(null);
    if (data.error) return toast.error(data.error);
    setAddresses(data.addresses);
    toast.success("Default address changed");
  };

  const remove = async (address) => {
    if (!window.confirm(`Remove this address?\n\n${address.line1}, ${address.city}`)) return;
    setBusyId(address.id);
    const data = await sendAddress(`/api/addresses/${address.id}`, "DELETE");
    setBusyId(null);
    if (data.error) return toast.error(data.error);
    await applied(data, "Address removed");
  };

  return (
    <section className="card p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium">Delivery addresses</h2>
          <p className="mt-1 text-sm text-muted">Your default address is selected for you at checkout.</p>
        </div>
        {editing === null && addresses.length > 0 && addresses.length < MAX_ADDRESSES && (
          <button type="button" onClick={() => setEditing("new")} className="btn-outline">
            <Plus className="h-4 w-4" /> Add address
          </button>
        )}
      </div>

      {legacyAddress && addresses.length === 0 && (
        <div className="mt-5 border-l-2 border-brand-2 bg-surface p-4 text-sm">
          <p className="font-medium">Please add your address again with its PIN code</p>
          <p className="mt-1 text-muted">We now need house number, area, PIN code, city and state separately so the courier can find you. Your earlier address was:</p>
          <p className="mt-2 whitespace-pre-line">{legacyAddress}</p>
        </div>
      )}

      <ul className="mt-5 space-y-3">
        {addresses.map((a) =>
          editing === a.id ? (
            <li key={a.id} className="border border-ink p-4 sm:p-5">
              <AddressForm initial={a} onSubmit={update(a.id)} onCancel={() => setEditing(null)} submitLabel="Save changes" />
            </li>
          ) : (
            <li key={a.id} className="flex flex-col gap-3 border border-line p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <AddressText address={a} />
              </div>
              <div className="flex shrink-0 flex-wrap gap-1 text-sm">
                {!a.isDefault && (
                  <button type="button" onClick={() => makeDefault(a.id)} disabled={busyId === a.id} className="btn-ghost px-2.5 py-1.5">
                    <Star className="h-3.5 w-3.5" /> Make default
                  </button>
                )}
                <button type="button" onClick={() => setEditing(a.id)} disabled={editing !== null} className="btn-ghost px-2.5 py-1.5" aria-label={`Edit address: ${a.line1}`}>
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button type="button" onClick={() => remove(a)} disabled={busyId === a.id} className="btn-ghost px-2.5 py-1.5 hover:text-red-700" aria-label={`Remove address: ${a.line1}`}>
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              </div>
            </li>
          )
        )}
      </ul>

      {(editing === "new" || addresses.length === 0) && (
        <div className={`${addresses.length ? "mt-3 border border-ink p-4 sm:p-5" : ""}`}>
          {addresses.length > 0 && <p className="mb-4 font-medium">New address</p>}
          <AddressForm
            initial={defaults}
            onSubmit={add}
            onCancel={addresses.length ? () => setEditing(null) : undefined}
          />
        </div>
      )}
    </section>
  );
}
