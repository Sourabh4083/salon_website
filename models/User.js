import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide your name"],
        trim: true,
    },
    // Sparse: accounts made before usernames existed do not have one yet.
    username: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true,
    },
    // No longer collected. Kept only so accounts created with an email can
    // still sign in with it.
    email: {
        type: String,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        minlength: 6,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    // Filled in later on the account page; sign-up only asks for the basics.
    phone: {
        type: String,
        trim: true,
        default: "",
    },
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