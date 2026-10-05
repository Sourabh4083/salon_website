import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/User";
import ProfileForm from "@/components/ProfileForm";

export const metadata = { title: "My account" };

export default async function ProfilePage() {
  // Middleware already guards /profile, but this page reads the DB directly
  // so it re-checks rather than relying solely on the matcher.
  const session = await getCurrentUser();
  if (!session) redirect("/login?redirect=/profile");

  await dbConnect();
  const user = await User.findById(session.id).select("name username phone address gender dateOfBirth").lean();
  if (!user) redirect("/login?redirect=/profile");

  const profile = {
    name: user.name || "",
    username: user.username || "",
    phone: user.phone || "",
    address: user.address || "",
    gender: user.gender || "",
    dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().slice(0, 10) : "",
  };

  return (
    <main className="container-x py-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <p className="eyebrow">Account</p>
        <h1 className="mt-2 text-3xl font-medium">My account</h1>
        <p className="mt-1 text-sm text-muted">
          Keep your details up to date so we can deliver your orders without a hitch.
        </p>

        <ProfileForm initialProfile={profile} />
      </div>
    </main>
  );
}
