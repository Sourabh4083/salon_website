// One-off: deletes ALL user accounts (they were test accounts) and switches
// the users collection to mobile-number login: drops the old username/email
// indexes and adds a unique index on `phone`. Orders and carts are not touched.
//
//   node --env-file=.env.local scripts/reset-users.mjs --yes

import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not set. Run with --env-file=.env.local");
  process.exit(1);
}
if (!process.argv.includes("--yes")) {
  console.error("This deletes every user account. Re-run with --yes to confirm.");
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;
const users = db.collection("users");

const total = await users.countDocuments();
const { deletedCount } = await users.deleteMany({});
console.log(`Deleted ${deletedCount} of ${total} user accounts`);

for (const name of ["username_1", "email_1"]) {
  const exists = (await users.indexes()).some((i) => i.name === name);
  if (exists) {
    await users.dropIndex(name);
    console.log(`Dropped index ${name}`);
  }
}

await users.createIndex({ phone: 1 }, { unique: true });
console.log("Indexes now:", (await users.indexes()).map((i) => i.name).join(", "));

await mongoose.disconnect();
