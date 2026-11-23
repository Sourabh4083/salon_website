// Delivery address fields, shared by User.addresses (the address book) and
// Order.shippingAddress (the copy kept with each order). Validation lives in
// lib/address.js (cleanAddress), which every write goes through.
export const addressFields = {
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  altPhone: { type: String, default: "" },
  line1: { type: String, required: true, trim: true },
  line2: { type: String, required: true, trim: true },
  landmark: { type: String, default: "" },
  pincode: { type: String, required: true, match: /^[1-9]\d{5}$/ },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true },
  type: { type: String, enum: ["home", "work"], default: "home" },
};
