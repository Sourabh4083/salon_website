import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/dbConnect";
import { getCurrentUser, setSessionCookie } from "@/lib/auth";
import { normaliseUsername, normaliseMobile, USERNAME_HINT } from "@/lib/validate";
import User from "@/models/User";

const GENDERS = ["", "male", "female", "other"];

function publicProfile(user) {
  return {
    name: user.name,
    username: user.username || "",
    phone: user.phone || "",
    address: user.address || "",
    gender: user.gender || "",
    // yyyy-mm-dd, which is what <input type="date"> reads and writes.
    dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().slice(0, 10) : "",
  };
}

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const user = await User.findById(session.id);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ profile: publicProfile(user) });
}

export async function PATCH(req) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const name = String(body.name || "").trim();
    const address = String(body.address || "").trim();
    const gender = String(body.gender || "");
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const username = normaliseUsername(body.username);
    if (!username) {
      return NextResponse.json({ error: `Username must be ${USERNAME_HINT}` }, { status: 400 });
    }

    const phone = normaliseMobile(body.phone);
    if (!phone) {
      return NextResponse.json({ error: "Enter a valid 10-digit mobile number" }, { status: 400 });
    }

    if (!GENDERS.includes(gender)) {
      return NextResponse.json({ error: "Please choose a gender from the list" }, { status: 400 });
    }

    let dateOfBirth = null;
    if (body.dateOfBirth) {
      dateOfBirth = new Date(body.dateOfBirth);
      if (Number.isNaN(dateOfBirth.getTime()) || dateOfBirth > new Date()) {
        return NextResponse.json({ error: "Please enter a valid date of birth" }, { status: 400 });
      }
    }

    if (newPassword && newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(session.id);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Anything that changes how the owner signs in needs the current password.
    const usernameChanged = username !== (user.username || "");
    if (usernameChanged || newPassword) {
      const isMatch = currentPassword && (await bcrypt.compare(currentPassword, user.password));
      if (!isMatch) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }
    }

    if (usernameChanged) {
      const taken = await User.findOne({ username, _id: { $ne: user._id } });
      if (taken) {
        return NextResponse.json({ error: "That username is already taken" }, { status: 400 });
      }
    }

    user.name = name;
    user.username = username;
    user.phone = phone;
    user.address = address;
    user.gender = gender;
    user.dateOfBirth = dateOfBirth;
    if (newPassword) {
      user.password = await bcrypt.hash(newPassword, 10);
    }
    await user.save();

    // Name, username and the profile flag live in the token, so issue a new one.
    return setSessionCookie(
      NextResponse.json({ message: "Profile updated", profile: publicProfile(user) }),
      user
    );
  } catch (error) {
    // Two accounts racing for the same username: the unique index catches it.
    if (error?.code === 11000) {
      return NextResponse.json({ error: "That username is already taken" }, { status: 400 });
    }
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
