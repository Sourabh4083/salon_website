import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { getCurrentUser } from "@/lib/auth";
import { cleanAddress, publicAddresses } from "@/lib/address";
import User from "@/models/User";

async function load(params) {
  const session = await getCurrentUser();
  if (!session) return { status: 401, error: "Unauthorized" };
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return { status: 404, error: "Address not found" };
  await dbConnect();
  const user = await User.findById(session.id);
  if (!user) return { status: 401, error: "Unauthorized" };
  const address = user.addresses.id(id);
  if (!address) return { status: 404, error: "Address not found" };
  return { user, address };
}

// PUT { ...address fields, makeDefault }   edit an address
// PUT { makeDefault: true } alone           just make it the default
export async function PUT(req, { params }) {
  try {
    const { user, address, status, error: loadError } = await load(params);
    if (loadError) return NextResponse.json({ error: loadError }, { status });

    const body = await req.json().catch(() => ({}));
    const onlyDefault = body.makeDefault && Object.keys(body).length === 1;

    if (!onlyDefault) {
      const { data, error, field } = cleanAddress(body);
      if (error) return NextResponse.json({ error, field }, { status: 400 });
      address.set(data);
    }
    if (body.makeDefault) {
      user.addresses.forEach((a) => { a.isDefault = a._id.equals(address._id); });
    }
    await user.save();

    return NextResponse.json({ addresses: publicAddresses(user) });
  } catch (err) {
    console.error("Update address error:", err);
    return NextResponse.json({ error: "Could not update the address" }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  try {
    const { user, address, status, error: loadError } = await load(params);
    if (loadError) return NextResponse.json({ error: loadError }, { status });

    const wasDefault = address.isDefault;
    address.deleteOne();
    // Keep exactly one default while any addresses remain.
    if (wasDefault && user.addresses.length > 0) user.addresses[0].isDefault = true;
    await user.save();

    return NextResponse.json({ addresses: publicAddresses(user) });
  } catch (err) {
    console.error("Delete address error:", err);
    return NextResponse.json({ error: "Could not remove the address" }, { status: 500 });
  }
}
