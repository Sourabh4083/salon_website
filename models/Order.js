import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  cartItem: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  userInfo: {
    name: String,
    phone: String,
    // Only on orders placed while checkout still asked for an email.
    email: String,
    address: String,
  },
  // What the customer paid: items + delivery, inclusive of GST.
  totalAmount: {
    type: Number,
    required: true,
  },
  // Breakup of totalAmount, stored so later rate changes never alter
  // what an old order reports.
  subtotal: Number,
  shippingAmount: Number,
  taxableAmount: Number,
  gstAmount: Number,
  gstRate: Number,
  paymentStatus: {
    type: String,
    enum: ["paid", "unpaid"],
    default: "unpaid",
  },
  deliveryStatus: {
    type: String,
    enum: ["pending", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
