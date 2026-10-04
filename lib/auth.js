
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

// Returns the current user only if they are an admin, otherwise null.
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;
  return user;
}
