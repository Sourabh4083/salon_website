import mongoose from "mongoose";
import { addressFields } from "@/models/Address";

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
  // Copy of the delivery address at the time of ordering, so editing a saved
  // address later never changes where an earlier order was sent. Orders from
  // before addresses had separate fields only have userInfo.address.
  shippingAddress: { type: new mongoose.Schema(addressFields, { _id: false }), default: undefined },
  // name/phone/address mirror shippingAddress (address is the formatted
  // text), so older screens and exports keep working.
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
  // Filled in by the admin when the parcel is handed to a courier, so the
  // customer can follow it on the courier's own site.
  courier: String,
  trackingNumber: String,
  trackingUrl: String,
  // When the delivery status first reached each stage.
  shippedAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  // The Razorpay order created for exactly this order's amount. The payment
  // is matched back to the order through it, so the cart and total that get
  // saved are the ones priced before payment, never ones sent afterwards.
  razorpayOrderId: { type: String, unique: true, sparse: true },
  // Unique so one payment can never mark two orders as paid.
  razorpayPaymentId: { type: String, unique: true, sparse: true },
  // Exactly what Razorpay was asked to charge, in paise.
  amountPaise: Number,
  // Items that had run out by the time payment came through. The customer
  // has paid for them, so the shop must refund or restock and contact them.
  stockShortfall: { type: [String], default: undefined },
  // Set only while unpaid: abandoned checkouts are deleted by MongoDB after
  // this time. Removed when the payment is confirmed, so paid orders stay.
  pendingExpiresAt: { type: Date, index: { expires: 0 } },
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
