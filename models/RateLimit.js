import mongoose from "mongoose";

// One counter per key (e.g. "login:phone:98765..." or "login:ip:1.2.3.4").
// Stored in MongoDB rather than memory because serverless instances do not
// share memory, so an in-memory counter would be trivially bypassed.
const rateLimitSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  // MongoDB deletes the document shortly after this time (TTL index).
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
});

export default mongoose.models.RateLimit || mongoose.model("RateLimit", rateLimitSchema);
