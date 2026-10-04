import mongoose from "mongoose";

// A saved cart holds only what the user chose: which product, how many.
// Title/price/image are read from the Product collection when the cart is
// loaded, so they can never go stale or be spoofed by the client.
const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  cartItem: [cartItemSchema],
});

export default mongoose.models.Cart || mongoose.model("Cart", cartSchema);
