import { Block, ListRowsSkeleton } from "@/components/skeletons/Skeleton";

export default function CartLoading() {
  return (
    <main className="container-x py-8 sm:py-12">
      <div>
        <Block className="h-10 w-56 mx-auto mb-8" />
        <ListRowsSkeleton rows={3} />
      </div>
    </main>
  );
}
