import { Block, ProductGridSkeleton } from "@/components/skeletons/Skeleton";

export default function ProductLoading() {
  return (
    <main className="container-x pb-28 pt-6 sm:pt-10 md:pb-12">
      <Block className="h-3 w-56" />
      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-16">
        <Block className="aspect-[4/5] w-full" />
        <div className="space-y-5">
          <Block className="h-3 w-32" />
          <Block className="h-12 w-3/4" />
          <Block className="h-8 w-1/3" />
          <Block className="h-24 w-full" />
          <div className="flex gap-3 pt-2">
            <Block className="h-12 flex-1" />
            <Block className="h-12 flex-1" />
          </div>
          <Block className="h-40 w-full" />
        </div>
      </div>
      <Block className="mt-20 h-8 w-56" />
      <div className="mt-8">
        <ProductGridSkeleton count={4} />
      </div>
    </main>
  );
}
