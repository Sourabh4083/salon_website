import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/dbConnect";
import { getCurrentUser, setSessionCookie, BCRYPT_ROUNDS } from "@/lib/auth";
import { passwordProblem } from "@/lib/validate";
import User from "@/models/User";

// Used only right after signing in with a temporary password from an admin
// reset. Normal password changes go through the account page (/api/profile),
// which asks for the current password.
export async function POST(req) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Please sign in again" }, { status: 401 });
    }
    if (!session.mustChangePassword) {
      return NextResponse.json({ error: "Change your password from your account page" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const newPassword = String(body.newPassword || "");
    const confirmPassword = String(body.confirmPassword || "");

    const problem = passwordProblem(newPassword, session.phone);
    if (problem) {
      return NextResponse.json({ error: problem }, { status: 400 });
    }
    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(session.id);
    if (!user) {
      return NextResponse.json({ error: "Please sign in again" }, { status: 401 });
    }

    // The temporary password was seen by the admin, so it must not be reused.
    if (await bcrypt.compare(newPassword, user.password)) {
      return NextResponse.json({ error: "Please choose a new password, not the temporary one" }, { status: 400 });
    }

    user.password = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    user.mustChangePassword = false;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    return setSessionCookie(NextResponse.json({ message: "Password changed" }), user);
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
