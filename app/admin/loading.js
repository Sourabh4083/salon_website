import { Block, ListRowsSkeleton } from "@/components/skeletons/Skeleton";

export default function AdminLoading() {
  return (
    <main className="container-x py-8 sm:py-12">
      <div>
        <Block className="h-10 w-64 mb-8" />
        <ListRowsSkeleton rows={4} />
      </div>
    </main>
  );
}
