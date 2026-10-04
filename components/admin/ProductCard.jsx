"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formateCurrency } from "@/utils/formatCurrency";
import toast from "react-hot-toast";

export default function ProductCard({ product }) {
    const router = useRouter();

    const handleDelete = async () => {
        const confirmed = confirm("Are you sure you want to delete this product?");
        if (!confirmed) return;

        try {
            const res = await fetch(`/api/products/${product._id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success("Product deleted");
                router.refresh();
            } else {
                const data = await res.json().catch(() => ({}));
                toast.error(data.error || "Failed to delete product");
            }
        } catch (err) {
            toast.error("Error deleting product");
            console.error(err);
        }
    };

    const attributes = [product.gender, product.hairType, product.category].filter(Boolean).join(" · ");

    return (
        <div className="card flex gap-4 p-4">
            <div className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden bg-slate-100">
                {product.image ? (
                    <Image src={product.image} alt={product.title} fill sizes="96px" className="object-cover" />
                ) : (
                    <span className="absolute inset-0 grid place-items-center text-xs text-muted">No photo</span>
                )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
                <p className="display line-clamp-2 text-lg font-medium leading-snug">{product.title}</p>
                {attributes && <p className="mt-0.5 text-xs text-muted">{attributes}</p>}
                <p className="mt-1 text-sm font-semibold">{formateCurrency(product.price)}</p>
                <p className={`text-sm ${product.stock <= 0 ? "font-semibold text-red-700" : "text-muted"}`}>
                    {product.stock <= 0 ? "Sold out" : `Stock: ${product.stock}`}
                </p>

                <div className="mt-auto flex gap-4 pt-2 text-sm">
                    <Link href={`/admin/manage-products/edit/${product._id}`} className="link">Edit</Link>
                    <button onClick={handleDelete} className="font-semibold text-red-700 underline underline-offset-4">Delete</button>
                </div>
            </div>
        </div>
    );
}
