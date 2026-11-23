import mongoose from "mongoose";
import { addressFields } from "@/models/Address";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide your name"],
        trim: true,
    },
    // 10-digit mobile number (no +91). This is what customers sign in with.
    phone: {
        type: String,
        required: [true, "Please provide your mobile number"],
        unique: true,
        trim: true,
    },
    // bcrypt hash, never the password itself.
    password: {
        type: String,
        required: [true, "Please provide a password"],
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    // Copied into the session token. Bumping it (password change or admin
    // reset) makes every older token invalid, signing out other devices.
    tokenVersion: {
        type: Number,
        default: 0,
    },
    // Set when an admin resets the password: the customer must choose a new
    // one right after signing in with the temporary password.
    mustChangePassword: {
        type: Boolean,
        default: false,
    },
    // Saved delivery addresses (at most MAX_ADDRESSES in lib/address.js).
    // Exactly one has isDefault while the list is non-empty.
    addresses: {
        type: [new mongoose.Schema({ ...addressFields, isDefault: { type: Boolean, default: false } })],
        default: [],
    },
    // Old single free-text address from before addresses had separate
    // fields. Only shown as a reminder until the customer adds a new one.
    address: {
        type: String,
        trim: true,
        default: "",
    },
    gender: {
        type: String,
        enum: ["", "male", "female", "other"],
        default: "",
    },
    dateOfBirth: {
        type: Date,
        default: null,
    },
}, { timestamps: true })

export default mongoose.models.User || mongoose.model("User", userSchema)
