import crypto from "crypto";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/dbConnect";
import { requireAdmin, BCRYPT_ROUNDS } from "@/lib/auth";
import { clearHits } from "@/lib/rateLimit";
import User from "@/models/User";

// No 0/O, 1/l/I: the admin reads this out or types it into WhatsApp.
const LETTERS = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
const DIGITS = "23456789";
const ALPHABET = LETTERS + DIGITS;

function pick(chars) {
  return chars[crypto.randomInt(chars.length)];
}

// e.g. "Kx7m-29Qa": 8 random characters, always with a letter and a digit.
function temporaryPassword() {
  for (;;) {
    const chars = Array.from({ length: 8 }, () => pick(ALPHABET)).join("");
    if (/[A-Za-z]/.test(chars) && /\d/.test(chars)) {
      return `${chars.slice(0, 4)}-${chars.slice(4)}`;
    }
  }
}

export async function POST(_req, { params }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  await dbConnect();
  const user = await User.findById(id);
  if (!user) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  // Admin accounts change their own password from the account page. This keeps
  // one admin session from quietly taking over another admin account.
  if (user.role === "admin") {
    return NextResponse.json(
      { error: "Admin passwords can't be reset here. Change it from the account page." },
      { status: 400 }
    );
  }

  const tempPassword = temporaryPassword();
  user.password = await bcrypt.hash(tempPassword, BCRYPT_ROUNDS);
  user.mustChangePassword = true;
  // Signs the customer out everywhere, in case someone else was using the account.
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save();

  // A customer locked out by wrong guesses can sign in straight away.
  await clearHits(`login:phone:${user.phone}`);

  console.info(`Password reset for customer ${user._id} by admin ${admin.id}`);

  // Shown to the admin once; it is never stored in readable form.
  return NextResponse.json({ tempPassword, name: user.name, phone: user.phone });
}
