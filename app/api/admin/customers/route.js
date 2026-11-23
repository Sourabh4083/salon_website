import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { requireAdmin } from "@/lib/auth";
import User from "@/models/User";

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// GET /api/admin/customers?q=98765  — search by mobile number or name.
export async function GET(req) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const q = String(new URL(req.url).searchParams.get("q") || "").trim().slice(0, 50);

  let filter = {};
  if (q) {
    const digits = q.replace(/\D/g, "");
    filter = digits.length >= 3
      ? { phone: { $regex: escapeRegex(digits.slice(-10)) } }
      : { name: { $regex: escapeRegex(q), $options: "i" } };
  }

  const customers = await User.find(filter)
    .select("name phone role mustChangePassword createdAt")
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return NextResponse.json(
    customers.map((c) => ({
      id: String(c._id),
      name: c.name,
      phone: c.phone,
      role: c.role,
      mustChangePassword: Boolean(c.mustChangePassword),
      createdAt: c.createdAt,
    }))
  );
}
