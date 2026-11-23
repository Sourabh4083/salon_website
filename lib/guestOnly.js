import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

// Used by the /login and /register layouts. Done here rather than in the
// middleware because only the database knows whether a cookie is still valid
// (a signed-out device still holds a correctly signed cookie).
export async function redirectIfSignedIn() {
  const user = await getCurrentUser();
  if (!user) return;
  redirect(user.mustChangePassword ? "/change-password" : "/");
}
