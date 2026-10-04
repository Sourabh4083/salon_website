import { dbConnect } from "@/lib/dbConnect";
import { requireAdmin } from "@/lib/auth";
import Product from "@/models/Product";
import { revalidateProducts } from "@/lib/products";
import { pickProductFields } from "@/lib/wig";
import { NextResponse } from "next/server";


export async function GET(req, { params }) {
    const { id } = await params
    await dbConnect()

    try {
        const product = await Product.findById(id).lean()
        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 })
        }
        return NextResponse.json({ product })
    } catch (err) {
        console.error("Fetch product error:", err)
        return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
    }
}

export async function PUT(req, { params }) {
    const admin = await requireAdmin()
    if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await dbConnect()

    // Same whitelist and coercion as POST.
    const { data, error } = pickProductFields(await req.json())
    if (error) {
        return NextResponse.json({ error }, { status: 400 })
    }

    try {
        const updated = await Product.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        })

        if (!updated) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 })
        }
        revalidateProducts()

        return NextResponse.json({ message: "Product updates", product: updated })
    } catch (err) {
        console.error("update error:", err)
        return NextResponse.json({ error: "Failed to update product" }, {status: 500})
    }
}

export async function DELETE(req, { params }) {
    const admin = await requireAdmin()
    if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await dbConnect()

    try {
        const deleted = await Product.findByIdAndDelete(id)
        if (!deleted) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 })
        }
        revalidateProducts()

        return NextResponse.json({ message: "Product deleted"})
    } catch (err) {
        console.error("Delete error:", err)
        return NextResponse.json({ error: "Failed to delete"}, { status: 500})
    }
}
