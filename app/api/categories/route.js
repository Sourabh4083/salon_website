import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { requireAdmin } from "@/lib/auth";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { getAllCategories, revalidateCategories } from "@/lib/products";
import { cleanCategoryName, sameNameRegex } from "@/lib/catalog";

// Every category with how many products use it. Admin only, because the
// storefront reads categories through lib/products.js instead.
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const categories = await getAllCategories();
  await dbConnect();
  const counts = await Product.aggregate([
    { $group: { _id: { $toLower: { $ifNull: ["$category", ""] } }, n: { $sum: 1 } } },
  ]);
  const byName = new Map(counts.map((c) => [c._id, c.n]));

  return NextResponse.json(
    categories.map((c) => ({ ...c, productCount: byName.get(c.name.toLowerCase()) || 0 }))
  );
}

export async function POST(req) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const name = cleanCategoryName(body?.name);
  if (!name) return NextResponse.json({ error: "Enter a category name" }, { status: 400 });

  try {
    await dbConnect();
    if (await Category.exists({ name: sameNameRegex(name) })) {
      return NextResponse.json({ error: `"${name}" already exists` }, { status: 409 });
    }
    // New categories go to the end of the list.
    const last = await Category.findOne().sort({ order: -1 }).lean();
    const category = await Category.create({ name, order: (last?.order ?? -1) + 1 });
    revalidateCategories();

    return NextResponse.json({
      category: { _id: String(category._id), name: category.name, order: category.order, productCount: 0 },
    });
  } catch (err) {
    console.error("Create category error:", err);
    return NextResponse.json({ error: "Failed to add category" }, { status: 500 });
  }
}
