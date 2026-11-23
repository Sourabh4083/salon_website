import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/dbConnect";
import { requireAdmin } from "@/lib/auth";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { revalidateCategories, revalidateProducts } from "@/lib/products";
import { cleanCategoryName, sameNameRegex } from "@/lib/catalog";

async function load(params) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return null;
  await dbConnect();
  return Category.findById(id);
}

// Rename. Products keep their category by name, so they are renamed too.
export async function PUT(req, { params }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const name = cleanCategoryName(body?.name);
  if (!name) return NextResponse.json({ error: "Enter a category name" }, { status: 400 });

  try {
    const category = await load(params);
    if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    const clash = await Category.exists({ _id: { $ne: category._id }, name: sameNameRegex(name) });
    if (clash) return NextResponse.json({ error: `"${name}" already exists` }, { status: 409 });

    const oldName = category.name;
    category.name = name;
    await category.save();
    const moved = await Product.updateMany({ category: sameNameRegex(oldName) }, { category: name });

    revalidateCategories();
    revalidateProducts();
    return NextResponse.json({
      category: { _id: String(category._id), name, order: category.order },
      productsUpdated: moved.modifiedCount,
    });
  } catch (err) {
    console.error("Rename category error:", err);
    return NextResponse.json({ error: "Failed to rename category" }, { status: 500 });
  }
}

// Refused while products still use the category, so none end up without one.
export async function DELETE(req, { params }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const category = await load(params);
    if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    const inUse = await Product.countDocuments({ category: sameNameRegex(category.name) });
    if (inUse > 0) {
      return NextResponse.json(
        {
          error: `${inUse} ${inUse === 1 ? "product uses" : "products use"} "${category.name}". Move ${inUse === 1 ? "it" : "them"} to another category or delete ${inUse === 1 ? "it" : "them"} first.`,
        },
        { status: 409 }
      );
    }

    // With none left the starter categories would be recreated, so keep one.
    if ((await Category.countDocuments()) <= 1) {
      return NextResponse.json({ error: "Keep at least one category. Add a new one before deleting this." }, { status: 409 });
    }

    await category.deleteOne();
    revalidateCategories();
    return NextResponse.json({ message: "Category deleted" });
  } catch (err) {
    console.error("Delete category error:", err);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
