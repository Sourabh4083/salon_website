import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/dbConnect";
import { getCurrentUser, setSessionCookie, BCRYPT_ROUNDS } from "@/lib/auth";
import { normaliseMobile, passwordProblem } from "@/lib/validate";
import User from "@/models/User";

const GENDERS = ["", "male", "female", "other"];
const PHONE_TAKEN = "This mobile number is already used by another account";

function publicProfile(user) {
  return {
    name: user.name,
    phone: user.phone || "",
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
    const name = String(body.name || "").trim().slice(0, 80);
    const gender = String(body.gender || "");
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
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

    if (newPassword) {
      const problem = passwordProblem(newPassword, phone);
      if (problem) {
        return NextResponse.json({ error: problem }, { status: 400 });
      }
    }

    await dbConnect();
    const user = await User.findById(session.id);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // The mobile number is the login ID, so changing it or the password needs
    // the current password. Stops someone at an unlocked phone taking over.
    const phoneChanged = phone !== user.phone;
    if (phoneChanged || newPassword) {
      const isMatch = currentPassword && (await bcrypt.compare(currentPassword, user.password));
      if (!isMatch) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }
    }

    if (phoneChanged && (await User.exists({ phone, _id: { $ne: user._id } }))) {
      return NextResponse.json({ error: PHONE_TAKEN }, { status: 400 });
    }

    user.name = name;
    user.phone = phone;
    user.gender = gender;
    user.dateOfBirth = dateOfBirth;
    if (newPassword) {
      user.password = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
      // Signs out every other device; this one gets a fresh cookie below.
      user.tokenVersion = (user.tokenVersion || 0) + 1;
    }
    await user.save();

    return setSessionCookie(
      NextResponse.json({ message: "Profile updated", profile: publicProfile(user) }),
      user
    );
  } catch (error) {
    // Two accounts racing for the same number: the unique index catches it.
    if (error?.code === 11000) {
      return NextResponse.json({ error: PHONE_TAKEN }, { status: 400 });
    }
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
