"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Search, KeyRound, Copy, X, Loader2 } from "lucide-react";

export default function CustomerManager() {
  const [query, setQuery] = useState("");
  const [customers, setCustomers] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [reset, setReset] = useState(null); // { name, phone, tempPassword }

  // Search as the admin types, with a short pause so we don't query per key.
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/customers?q=${encodeURIComponent(query)}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = await res.json().catch(() => []);
        if (res.ok) setCustomers(data);
        else toast.error(data.error || "Could not load customers");
      } catch (err) {
        if (err.name !== "AbortError") toast.error("Network error");
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const resetPassword = async (c) => {
    if (!confirm(`Reset the password for ${c.name} (${c.phone})?\n\nOnly do this if they messaged you from this same number. They will be signed out everywhere.`)) {
      return;
    }
    setBusyId(c.id);
    try {
      const res = await fetch(`/api/admin/customers/${c.id}/reset-password`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Could not reset the password");
        return;
      }
      setReset(data);
      setCustomers((list) => list?.map((x) => (x.id === c.id ? { ...x, mustChangePassword: true } : x)));
    } catch {
      toast.error("Network error");
    } finally {
      setBusyId(null);
    }
  };

  const message = reset
    ? `Hi ${reset.name}, your temporary password is: ${reset.tempPassword}\nSign in with your mobile number and this password, then choose a new password.`
    : "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      toast.success("Copied");
    } catch {
      toast.error("Could not copy. Please select the text and copy it.");
    }
  };

  return (
    <div className="mt-8">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by mobile number or name"
          className="input pl-10"
          aria-label="Search customers"
        />
      </div>

      {reset && (
        <div className="card mt-6 border-l-4 border-l-brand-2 p-5" role="status">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-medium">Temporary password for {reset.name} ({reset.phone})</p>
              <p className="mt-2 select-all font-mono text-2xl tracking-wider">{reset.tempPassword}</p>
              <p className="mt-2 text-xs text-muted">
                This is shown only once. Send it to the customer on WhatsApp now.
              </p>
            </div>
            <button type="button" onClick={() => setReset(null)} className="grid h-10 w-10 shrink-0 place-items-center text-muted hover:text-ink" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
          <button type="button" onClick={copy} className="btn-primary mt-4 px-4 py-2 text-sm">
            <Copy className="h-4 w-4" /> Copy WhatsApp message
          </button>
        </div>
      )}

      {customers === null ? (
        <p className="mt-6 text-muted">Loading customers…</p>
      ) : customers.length === 0 ? (
        <p className="card mt-6 p-8 text-center text-muted">No customers found.</p>
      ) : (
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {customers.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {c.name}
                  {c.role === "admin" && <span className="ml-2 border border-line px-1.5 py-0.5 text-xs text-muted">Admin</span>}
                </p>
                <p className="text-sm text-muted">
                  {c.phone} · joined {new Date(c.createdAt).toLocaleDateString("en-IN")}
                  {c.mustChangePassword && <span className="ml-2 text-accent">· waiting for new password</span>}
                </p>
              </div>
              {c.role !== "admin" && (
                <button
                  type="button"
                  onClick={() => resetPassword(c)}
                  disabled={busyId === c.id}
                  className="flex min-h-11 items-center gap-2 border border-line px-3 text-sm hover:border-ink disabled:opacity-60"
                >
                  {busyId === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                  Reset password
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
