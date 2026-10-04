"use client";

import Link from "next/link";

export default function RootError({ error, reset }) {
  return (
    <main className="container-x flex min-h-[60vh] flex-col items-center justify-center gap-4 py-16 text-center">
      <h1 className="text-3xl font-medium sm:text-4xl">Something went wrong</h1>
      <p className="max-w-md text-muted">
        {error?.message || "An unexpected error occurred while loading this page."}
      </p>
      <div className="mt-2 flex gap-3">
        <button onClick={reset} className="btn-primary">
          Try again
        </button>
        <Link href="/" className="btn-outline">
          Go home
        </Link>
      </div>
    </main>
  );
}
