import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/User";
import ProfileForm from "@/components/ProfileForm";
import AddressBook from "@/components/AddressBook";
import { publicAddresses } from "@/lib/address";

export const metadata = { title: "My account" };

export default async function ProfilePage() {
  // Middleware already guards /profile, but this page reads the DB directly
  // so it re-checks rather than relying solely on the matcher.
  const session = await getCurrentUser();
  if (!session) redirect("/login?redirect=/profile");

  await dbConnect();
  const user = await User.findById(session.id)
    .select("name phone address addresses gender dateOfBirth createdAt")
    .lean();
  if (!user) redirect("/login?redirect=/profile");

  const profile = {
    name: user.name || "",
    phone: user.phone || "",
    gender: user.gender || "",
    dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().slice(0, 10) : "",
  };

  const addresses = publicAddresses(user);

  // Shown in the summary card only; not editable here.
  const account = {
    memberSince: user.createdAt
      ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
      : "",
  };

  return (
    <main className="container-x py-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <p className="eyebrow">Account</p>
        <h1 className="mt-2 text-3xl font-medium">My account</h1>

        <ProfileForm initialProfile={profile} account={account} hasAddress={addresses.length > 0}>
          <AddressBook
            initialAddresses={addresses}
            legacyAddress={addresses.length ? "" : user.address || ""}
            defaults={{ name: profile.name, phone: profile.phone }}
          />
        </ProfileForm>
      </div>
    </main>
  );
}
