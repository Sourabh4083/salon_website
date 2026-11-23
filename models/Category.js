import mongoose from "mongoose";

// Products store their category by name (Product.category), so renaming a
// category also renames it on its products (see app/api/categories/[id]).
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    // Lower comes first in the navbar, tiles and filters.
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Category || mongoose.model("Category", categorySchema);
