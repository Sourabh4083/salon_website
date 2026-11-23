import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { getCurrentUser } from "@/lib/auth";
import { cleanAddress, publicAddresses, MAX_ADDRESSES } from "@/lib/address";
import User from "@/models/User";

async function loadUser() {
  const session = await getCurrentUser();
  if (!session) return null;
  await dbConnect();
  return User.findById(session.id);
}

export async function GET() {
  const user = await loadUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({
    addresses: publicAddresses(user),
    // The old free-text address, shown as a reminder until a new one is added.
    legacyAddress: user.addresses?.length ? "" : user.address || "",
  });
}

// POST { ...address fields, makeDefault }
export async function POST(req) {
  try {
    const user = await loadUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { data, error, field } = cleanAddress(body);
    if (error) return NextResponse.json({ error, field }, { status: 400 });

    if (user.addresses.length >= MAX_ADDRESSES) {
      return NextResponse.json(
        { error: `You can save up to ${MAX_ADDRESSES} addresses. Remove one to add another.` },
        { status: 400 }
      );
    }

    // The first address is always the default.
    const makeDefault = Boolean(body.makeDefault) || user.addresses.length === 0;
    if (makeDefault) user.addresses.forEach((a) => { a.isDefault = false; });
    user.addresses.push({ ...data, isDefault: makeDefault });
    await user.save();

    const added = user.addresses[user.addresses.length - 1];
    return NextResponse.json({ id: String(added._id), addresses: publicAddresses(user) });
  } catch (err) {
    console.error("Add address error:", err);
    return NextResponse.json({ error: "Could not save the address" }, { status: 500 });
  }
}
