import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import ChangePasswordForm from "@/components/ChangePasswordForm";

export const metadata = { title: "Choose a new password" };

export default async function ChangePasswordPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  // Only reachable after an admin reset; everyone else uses the account page.
  if (!user.mustChangePassword) redirect("/profile");

  return <ChangePasswordForm phone={user.phone} />;
}
