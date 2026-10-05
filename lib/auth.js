
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded; 
  } catch (err) {
    return null;
  }
}

// The account page is "complete" once every optional detail is filled in.
export function isProfileComplete(user) {
  return Boolean(user?.phone && user?.address && user?.gender && user?.dateOfBirth);
}

// Signs the session token and sets it on the response. Name, username and the
// profile flag live inside the token, so call this again whenever they change.
export function setSessionCookie(response, user) {
  const token = jwt.sign(
    {
      id: String(user._id),
      username: user.username || "",
      name: user.name,
      role: user.role,
      profileComplete: isProfileComplete(user),
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

// Returns the current user only if they are an admin, otherwise null.
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;
  return user;
}
