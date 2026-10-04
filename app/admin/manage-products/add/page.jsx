import ProductForm from "@/components/admin/ProductForm";


export default function AddProductPage() {
    return (
        <div className="container-x py-10">
            <h1 className="mb-6 text-4xl font-medium">Add New Product</h1>
            <ProductForm />
        </div>
    )
}