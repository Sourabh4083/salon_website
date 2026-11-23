"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Pencil, Trash2, Check, X } from "lucide-react";

export default function CategoryManager() {
  const router = useRouter();
  const [categories, setCategories] = useState(null);
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState(null); // { id, name }
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const res = await fetch("/api/categories", { cache: "no-store" });
    const data = await res.json().catch(() => []);
    if (res.ok) setCategories(data);
    else toast.error(data.error || "Could not load categories");
  };

  useEffect(() => {
    load();
  }, []);

  // Sends a request, shows its error if any, and reloads the list on success.
  const send = async (url, method, body) => {
    setBusy(true);
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Something went wrong");
        return null;
      }
      await load();
      router.refresh();
      return data;
    } catch {
      toast.error("Network error. Please try again.");
      return null;
    } finally {
      setBusy(false);
    }
  };

  const add = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    if (await send("/api/categories", "POST", { name: newName })) {
      toast.success("Category added");
      setNewName("");
    }
  };

  const rename = async () => {
    if (!editing?.name.trim()) return;
    const data = await send(`/api/categories/${editing.id}`, "PUT", { name: editing.name });
    if (data) {
      toast.success(
        data.productsUpdated
          ? `Renamed. ${data.productsUpdated} ${data.productsUpdated === 1 ? "product" : "products"} updated.`
          : "Renamed"
      );
      setEditing(null);
    }
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete the category "${c.name}"?`)) return;
    if (await send(`/api/categories/${c._id}`, "DELETE")) toast.success("Category deleted");
  };

  return (
    <div className="mt-8 max-w-2xl">
      <form onSubmit={add} className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="new-category" className="label req">New category</label>
          <input
            id="new-category"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            maxLength={60}
            className="input"
            placeholder="Hair oils"
          />
        </div>
        <button type="submit" disabled={busy || !newName.trim()} className="btn-primary">
          Add category
        </button>
      </form>

      {categories === null ? (
        <p className="mt-6 text-sm text-muted">Loading…</p>
      ) : (
        <ul className="card mt-6 divide-y divide-line">
          {categories.map((c) => {
            const isEditing = editing?.id === c._id;
            return (
              <li key={c._id} className="flex flex-wrap items-center gap-3 p-4">
                {isEditing ? (
                  <input
                    autoFocus
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") rename();
                      if (e.key === "Escape") setEditing(null);
                    }}
                    maxLength={60}
                    className="input min-w-0 flex-1"
                    aria-label={`New name for ${c.name}`}
                  />
                ) : (
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-xs text-muted">
                      {c.productCount} {c.productCount === 1 ? "product" : "products"}
                      {c.productCount === 0 && " · hidden in the shop until a product is added"}
                    </p>
                  </div>
                )}

                <div className="flex gap-1">
                  {isEditing ? (
                    <>
                      <button onClick={rename} disabled={busy} className="grid h-11 w-11 place-items-center hover:bg-slate-100" aria-label="Save name">
                        <Check className="h-4 w-4" />
                      </button>
                      <button onClick={() => setEditing(null)} className="grid h-11 w-11 place-items-center hover:bg-slate-100" aria-label="Cancel">
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditing({ id: c._id, name: c.name })}
                        disabled={busy}
                        className="grid h-11 w-11 place-items-center hover:bg-slate-100"
                        aria-label={`Rename ${c.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => remove(c)}
                        disabled={busy}
                        className="grid h-11 w-11 place-items-center text-red-700 hover:bg-red-50"
                        aria-label={`Delete ${c.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-4 text-sm text-muted">
        Renaming a category also renames it on its products. A category can only be deleted once no product uses it.
      </p>
    </div>
  );
}
