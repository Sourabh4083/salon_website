export const dynamic = "force-dynamic";


import ProductCard from "@/components/admin/ProductCard"
import { dbConnect } from "@/lib/dbConnect"
import { requireAdmin } from "@/lib/auth"
import Product from "@/models/Product"
import Link from "next/link"

export default async function ManageProductsPage() {
    // Middleware already guards /admin, but this page reads the DB directly
    // so it re-checks rather than relying solely on the matcher.
    const admin = await requireAdmin()
    if (!admin) {
        return <p className="container-x py-10">Access Denied. Admin only.</p>
    }

    await dbConnect()
    const rawProducts = await Product.find().sort({ createdAt: -1 }).lean()

    const products = rawProducts.map((p) => ({
        _id: p._id.toString(),
        title: p.title || "",
        price: p.price || 0,
        image: p.image || p.images?.[0] || "",
        category: p.category || "",
        gender: p.gender || "",
        hairType: p.hairType || "",
        stock: p.stock ?? 0,
    }))

    return (
        <div className="container-x py-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="eyebrow">Admin</p>
                    <h1 className="mt-2 text-4xl font-medium">Products</h1>
                    <p className="mt-1 text-sm text-muted">{products.length} {products.length === 1 ? "product" : "products"}</p>
                </div>
                <Link href="/admin/manage-products/add" className="btn-primary">Add new product</Link>
            </div>

            {products.length === 0 ? (
                <p className="card mt-8 p-8 text-center text-muted">No products yet. Add your first wig to open the shop.</p>
            ) : (
                <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {products.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </div>
    )
}
