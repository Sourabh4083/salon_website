import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { requireAdmin } from "@/lib/auth";
import Product from "@/models/Product";
import { getProducts, revalidateProducts } from "@/lib/products";
import { pickProductFields } from "@/lib/wig";


export async function POST(req) {
    try {
        const admin = await requireAdmin()
        if (!admin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { data, error } = pickProductFields(await req.json())
        if (error) {
            return NextResponse.json({ error }, { status: 400 })
        }

        await dbConnect()

        const savedProduct = await Product.create(data)
        revalidateProducts()

        return NextResponse.json({ message: "Product saved successfully", product: savedProduct })

    } catch (err) {
        console.error("Error saving product:", err)
        return NextResponse.json({ error: "Failed to add product" }, { status: 500 })
    }
}

export async function GET() {
    // Served from the same cache the storefront uses; no DB hit per request.
    const products = await getProducts()
    return NextResponse.json(products, {
        headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    })
}
