import { Block, ProductGridSkeleton } from "@/components/skeletons/Skeleton";

export default function HomeLoading() {
  return (
    <main>
      <div className="container-x grid items-center gap-10 py-10 md:grid-cols-[1fr_0.9fr] md:gap-16 md:py-16">
        <div className="order-2 space-y-5 md:order-1">
          <Block className="h-3 w-40" />
          <Block className="h-28 w-4/5" />
          <Block className="h-12 w-full max-w-md" />
          <Block className="h-12 w-64" />
        </div>
        <Block className="order-1 aspect-[4/5] md:order-2" />
      </div>
      <div className="container-x pt-16">
        <Block className="h-9 w-64" />
        <div className="mt-10">
          <ProductGridSkeleton />
        </div>
      </div>
    </main>
  );
}
