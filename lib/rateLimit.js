import RateLimit from "@/models/RateLimit";

/** Current count for `key`, or 0 if it has no live window. Call dbConnect first. */
export async function getHits(key) {
  const doc = await RateLimit.findOne({ key, expiresAt: { $gt: new Date() } }).lean();
  return doc?.count || 0;
}

/** Minutes until `key`'s window ends (at least 1). */
export async function minutesLeft(key) {
  const doc = await RateLimit.findOne({ key }).lean();
  if (!doc) return 1;
  return Math.max(1, Math.ceil((new Date(doc.expiresAt) - Date.now()) / 60000));
}

/** Adds one hit to `key`, starting a new window of `windowMs` if needed. Returns the new count. */
export async function addHit(key, windowMs) {
  const now = new Date();
  // TTL cleanup runs about once a minute, so drop an expired window ourselves.
  await RateLimit.deleteOne({ key, expiresAt: { $lte: now } });
  const update = {
    $inc: { count: 1 },
    $setOnInsert: { expiresAt: new Date(now.getTime() + windowMs) },
  };
  try {
    const doc = await RateLimit.findOneAndUpdate({ key }, update, { upsert: true, new: true });
    return doc.count;
  } catch (err) {
    // Two requests upserting the same new key at once: retry as a plain update.
    if (err?.code !== 11000) throw err;
    const doc = await RateLimit.findOneAndUpdate({ key }, update, { upsert: true, new: true });
    return doc.count;
  }
}

export async function clearHits(key) {
  await RateLimit.deleteOne({ key });
}

/** Best-effort client IP. On Vercel the first x-forwarded-for entry is the client. */
export function clientIp(req) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}
