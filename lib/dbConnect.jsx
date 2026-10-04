import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
    throw new Error("⚠️ Please define MONGODB_URI in .env.local")
}

// The cache must be stored back on `global`, otherwise every hot reload in dev
// starts with a fresh object and opens another connection.
let cached = global.mongoose

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null }
}

export async function dbConnect() {
    if (cached.conn) return cached.conn


    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false
        })
    }


    try {
        cached.conn = await cached.promise
    } catch (err) {
        // Clear the failed promise so the next call can retry instead of
        // re-awaiting a permanently rejected one.
        cached.promise = null
        throw err
    }

    return cached.conn

}