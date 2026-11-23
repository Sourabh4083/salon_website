import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import CustomerManager from "@/components/admin/CustomerManager";

export const metadata = { title: "Customers" };

export default async function CustomersPage() {
  const admin = await requireAdmin();
  if (!admin) {
    return <p className="container-x py-10">Access Denied. Admin only.</p>;
  }

  return (
    <div className="container-x py-10">
      <p className="eyebrow">
        <Link href="/admin" className="hover:text-ink">Admin</Link>
      </p>
      <h1 className="mt-2 text-4xl font-medium">Customers</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        To reset a forgotten password, first check the customer messaged you from the
        same mobile number as their account. Then send them the temporary password. They
        will be asked to choose a new one when they sign in.
      </p>
      <CustomerManager />
    </div>
  );
}
