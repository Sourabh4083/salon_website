import Link from "next/link";

export default function ProductNotFound() {
  return (
    <main className="container-x flex min-h-[60vh] flex-col items-center justify-center gap-4 py-16 text-center">
      <p className="eyebrow">Not found</p>
      <h1 className="text-3xl font-medium sm:text-4xl">We could not find that wig</h1>
      <p className="text-muted">It may have been removed, or the link is wrong.</p>
      <Link href="/#products" className="btn-primary mt-2">
        See all wigs
      </Link>
    </main>
  );
}
