// Small building blocks for route-level loading states. Pure CSS, no JS.

export function Block({ className = "" }) {
  return <div className={`animate-pulse bg-slate-200/80 ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div>
      <Block className="aspect-[4/5] w-full" />
      <div className="space-y-2.5 pt-3">
        <Block className="h-3 w-1/3" />
        <Block className="h-5 w-4/5" />
        <Block className="h-4 w-1/4" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ListRowsSkeleton({ rows = 4 }) {
  return (
    <ul className="card divide-y divide-line">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex items-center gap-4 p-5">
          <Block className="h-24 w-24 shrink-0" />
          <div className="flex-1 space-y-2">
            <Block className="h-5 w-1/2" />
            <Block className="h-4 w-1/4" />
            <Block className="h-4 w-1/3" />
          </div>
        </li>
      ))}
    </ul>
  );
}
