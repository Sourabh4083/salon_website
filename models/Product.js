import mongoose from "mongoose";
import { SUITABLE_FOR } from "@/lib/catalog";

const productsSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: String,
        // Selling price, inclusive of GST.
        price: {
            type: Number,
            required: true,
        },
        // Optional list price; shown struck through only when above price.
        mrp: {
            type: Number,
            default: 0,
        },
        // Primary photo (same as images[0]).
        image: String,
        images: {
            type: [String],
            default: [],
        },
        category: String,
        brand: String,
        // Free text: "200 ml", "1 roll", "pack of 36".
        size: String,
        suitableFor: { type: String, enum: [...SUITABLE_FOR, ""], default: "" },
        color: String,
        stock: {
            type: Number,
            default: 0
        },
        slug: String
    },
    { timestamps: true }

)

export default mongoose.models.Product || mongoose.model("Product", productsSchema)
