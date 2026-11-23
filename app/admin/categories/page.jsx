import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import CategoryManager from "@/components/admin/CategoryManager";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const admin = await requireAdmin();
  if (!admin) {
    return <p className="container-x py-10">Access Denied. Admin only.</p>;
  }

  return (
    <div className="container-x py-10">
      <p className="eyebrow">
        <Link href="/admin" className="hover:text-ink">Admin</Link>
      </p>
      <h1 className="mt-2 text-4xl font-medium">Categories</h1>
      <p className="mt-1 text-sm text-muted">
        These appear in the shop menu, as tiles on the homepage and in the product form.
      </p>
      <CategoryManager />
    </div>
  );
}
