"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { GENDERS, HAIR_TYPES, BASE_TYPES, LENGTHS, MAX_IMAGES } from "@/lib/wig";
import { gstPercent } from "@/lib/site";

function Select({ label, name, value, onChange, options }) {
  return (
    <div>
      <label htmlFor={name} className="label">{label}</label>
      <select id={name} name={name} value={value} onChange={onChange} className="input">
        <option value="">Not specified</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function ProductForm({ product }) {
  const router = useRouter();
  const fileInputRef = useRef();

  const [formData, setFormData] = useState({
    title: product?.title || "",
    description: product?.description || "",
    price: product?.price || "",
    mrp: product?.mrp || "",
    stock: product?.stock ?? "",
    category: product?.category || "",
    gender: product?.gender || "",
    hairType: product?.hairType || "",
    baseType: product?.baseType || "",
    length: product?.length || "",
    color: product?.color || "",
  });
  // Older products only have the single `image` field.
  const [images, setImages] = useState(
    product?.images?.length ? product.images : product?.image ? [product.image] : []
  );

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const files = [...e.target.files].slice(0, MAX_IMAGES - images.length);
    if (files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        const body = new FormData();
        body.append("image", file);

        const res = await fetch("/api/upload", { method: "POST", body });
        const data = await res.json().catch(() => ({}));

        if (res.ok && data.url) {
          setImages((prev) => [...prev, data.url]);
        } else {
          toast.error(`${file.name}: ${data.error || "upload failed"}`);
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Image upload failed");
    } finally {
      // Always reset, otherwise a failed upload leaves the form stuck
      // showing "Uploading..." forever.
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (url) => setImages((prev) => prev.filter((u) => u !== url));
  const makePrimary = (url) => setImages((prev) => [url, ...prev.filter((u) => u !== url)]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(product?._id ? `/api/products/${product._id}` : "/api/products", {
        method: product?._id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, images }),
      });

      if (res.ok) {
        toast.success(product?._id ? "Product updated" : "Product created");
        router.push("/admin/manage-products");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Failed to save product");
        setSaving(false);
      }
    } catch {
      toast.error("Network error. Please try again.");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card max-w-3xl space-y-8 p-6 sm:p-8">
      <section className="space-y-5">
        <h2 className="text-xl font-medium">Basics</h2>

        <div>
          <label htmlFor="title" className="label">Name</label>
          <input id="title" name="title" value={formData.title} onChange={handleChange} className="input" required />
        </div>

        <div>
          <label htmlFor="description" className="label">Description</label>
          <textarea
            id="description"
            name="description"
            rows={5}
            value={formData.description}
            onChange={handleChange}
            className="input"
            placeholder="Texture, density, how it is worn, care instructions"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="price" className="label">Selling price (₹)</label>
            <input id="price" name="price" type="number" min="1" step="1" value={formData.price} onChange={handleChange} className="input" required />
            <p className="mt-1 text-xs text-muted">Including {gstPercent}% GST</p>
          </div>
          <div>
            <label htmlFor="mrp" className="label">MRP (₹)</label>
            <input id="mrp" name="mrp" type="number" min="0" step="1" value={formData.mrp} onChange={handleChange} className="input" />
            <p className="mt-1 text-xs text-muted">Optional. Shown crossed out if higher.</p>
          </div>
          <div>
            <label htmlFor="stock" className="label">Stock</label>
            <input id="stock" name="stock" type="number" min="0" step="1" value={formData.stock} onChange={handleChange} className="input" />
          </div>
        </div>
      </section>

      <section className="space-y-5 border-t border-line pt-8">
        <h2 className="text-xl font-medium">Wig details</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <Select label="For" name="gender" value={formData.gender} onChange={handleChange} options={GENDERS} />
          <Select label="Hair type" name="hairType" value={formData.hairType} onChange={handleChange} options={HAIR_TYPES} />
          <Select label="Base" name="baseType" value={formData.baseType} onChange={handleChange} options={BASE_TYPES} />
          <div>
            <label htmlFor="length" className="label">Length</label>
            <input id="length" name="length" list="length-options" value={formData.length} onChange={handleChange} className="input" placeholder="Short, or 14 inches" />
            <datalist id="length-options">
              {LENGTHS.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
          </div>
          <div>
            <label htmlFor="color" className="label">Colour</label>
            <input id="color" name="color" value={formData.color} onChange={handleChange} className="input" placeholder="Natural black" />
          </div>
          <div>
            <label htmlFor="category" className="label">Category</label>
            <input id="category" name="category" value={formData.category} onChange={handleChange} className="input" placeholder="Hair patch, Full wig, Topper" />
            <p className="mt-1 text-xs text-muted">Appears as a section on the homepage.</p>
          </div>
        </div>
      </section>

      <section className="space-y-4 border-t border-line pt-8">
        <h2 className="text-xl font-medium">Photos</h2>
        <p className="text-sm text-muted">
          Up to {MAX_IMAGES} photos, under 1 MB each. Portrait photos look best. The first one is the main photo.
        </p>

        {images.length > 0 && (
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {images.map((url, i) => (
              <li key={url} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Photo ${i + 1}`} className="aspect-[4/5] w-full border border-line object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  aria-label={`Remove photo ${i + 1}`}
                  className="absolute right-1 top-1 grid h-7 w-7 place-items-center bg-ink text-white"
                >
                  <X className="h-4 w-4" />
                </button>
                {i === 0 ? (
                  <p className="mt-1 text-center text-[11px] font-semibold uppercase tracking-wider text-accent">Main</p>
                ) : (
                  <button type="button" onClick={() => makePrimary(url)} className="mt-1 w-full text-center text-[11px] underline">
                    Make main
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" multiple hidden />

        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          disabled={uploading || images.length >= MAX_IMAGES}
          className="btn-outline"
        >
          {uploading ? "Uploading..." : "Add photos"}
        </button>
      </section>

      <div className="border-t border-line pt-6">
        <button type="submit" disabled={uploading || saving} className="btn-primary px-8">
          {saving ? "Saving..." : product?._id ? "Update product" : "Add product"}
        </button>
      </div>
    </form>
  );
}
