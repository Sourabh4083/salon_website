import ProductForm from "@/components/admin/ProductForm";
import { dbConnect } from "@/lib/dbConnect";
import { requireAdmin } from "@/lib/auth";
import Product from "@/models/Product";

export default async function EditProductPage({ params }) {
    const admin = await requireAdmin()
    if (!admin) {
        return <p className="p-6">Access Denied. Admin only.</p>
    }

    const { id } = await params

    await dbConnect()

    const product = await Product.findById(id).lean()

    if (!product) {
        return <p>Product not found</p>
    }

    const formattedProduct = {
        ...product,
        _id: product._id.toString(),
        createdAt: product.createdAt?.toISOString?.(),
        updatedAt: product.updatedAt?.toISOString?.()
    }

    return (
        <div className="container-x py-10">
            <h1 className="mb-6 text-4xl font-medium">Edit Product</h1>
            <ProductForm product={formattedProduct} />
        </div>
    )
}