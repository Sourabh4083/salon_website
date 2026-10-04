import mongoose from "mongoose";
import { GENDERS, HAIR_TYPES, BASE_TYPES } from "@/lib/wig";

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
        gender: { type: String, enum: [...GENDERS, ""], default: "" },
        hairType: { type: String, enum: [...HAIR_TYPES, ""], default: "" },
        baseType: { type: String, enum: [...BASE_TYPES, ""], default: "" },
        length: String,
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
