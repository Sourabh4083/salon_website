// One-off: accounts no longer have an email, so the old unique index on
// `email` would reject the second account created without one. This drops it
// and makes sure the username index exists. Indexes only; no user data changes.
//
//   node --env-file=.env.local scripts/fix-user-indexes.mjs

import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not set. Run with --env-file=.env.local");
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);
const users = mongoose.connection.collection("users");

const before = await users.indexes();
console.log("Indexes before:", before.map((i) => i.name).join(", "));

if (before.some((i) => i.name === "email_1")) {
  await users.dropIndex("email_1");
  console.log("Dropped email_1");
} else {
  console.log("email_1 not present, nothing to drop");
}

await users.createIndex({ username: 1 }, { unique: true, sparse: true });

const after = await users.indexes();
console.log("Indexes after:", after.map((i) => i.name).join(", "));

const total = await users.countDocuments();
const withoutUsername = await users.countDocuments({ username: { $in: [null, ""] } });
console.log(`${total} accounts, ${withoutUsername} without a username (they sign in with their email)`);

await mongoose.disconnect();
