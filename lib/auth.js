import { cache } from "react";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/User";

export const BCRYPT_ROUNDS = 12;

// The account page is "complete" once every optional detail is filled in.
export function isProfileComplete(user) {
  return Boolean(user?.phone && user?.addresses?.length && user?.gender && user?.dateOfBirth);
}

/**
 * The signed-in user, or null. The token alone is not trusted: the account is
 * re-read from the database on every call, so
 *  - a deleted account is signed out at once,
 *  - a password change or admin reset (tokenVersion bump) signs out old devices,
 *  - removing someone's admin role takes effect immediately.
 * `cache` makes the layout and the page share one lookup per request.
 */
export const getCurrentUser = cache(async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await dbConnect();
    const user = await User.findById(decoded.id)
      .select("name phone role tokenVersion mustChangePassword addresses._id gender dateOfBirth")
      .lean();
    if (!user || (user.tokenVersion || 0) !== (decoded.tv || 0)) return null;

    return {
      id: String(user._id),
      name: user.name,
      phone: user.phone,
      role: user.role,
      profileComplete: isProfileComplete(user),
      mustChangePassword: Boolean(user.mustChangePassword),
    };
  } catch {
    return null;
  }
});

// Signs the session token and sets it on the response. Call again whenever
// the user's name, profile, password or tokenVersion changes.
export function setSessionCookie(response, user) {
  const token = jwt.sign(
    {
      id: String(user._id),
      name: user.name,
      role: user.role,
      tv: user.tokenVersion || 0,
      // Read by the middleware, which cannot reach the database.
      mcp: Boolean(user.mustChangePassword),
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}

// Returns the current user only if the database says they are an admin.
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;
  return user;
}
