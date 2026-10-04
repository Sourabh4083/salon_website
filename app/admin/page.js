import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Admin" };

export default async function AdminDashboard() {
    const admin = await requireAdmin()

    if (!admin) {
        return <p className="container-x py-10">Access Denied. Admin only.</p>
    }

    const links = [
        { href: "/admin/manage-products", title: "Products", text: "Add wigs, edit details, photos and stock." },
        { href: "/admin/orders", title: "Orders", text: "See what customers have ordered and paid." },
    ]

    return (
        <div className="container-x py-10">
            <p className="eyebrow">Admin</p>
            <h1 className="mt-2 text-4xl font-medium">Dashboard</h1>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {links.map((l) => (
                    <li key={l.href}>
                        <Link href={l.href} className="card card-hover block p-6">
                            <h2 className="text-2xl font-medium">{l.title}</h2>
                            <p className="mt-1 text-sm text-muted">{l.text}</p>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}
