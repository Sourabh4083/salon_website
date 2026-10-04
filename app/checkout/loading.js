import { Block } from "@/components/skeletons/Skeleton";

export default function CheckoutLoading() {
  return (
    <main className="container-x py-8 sm:py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <Block className="h-10 w-48 mx-auto" />
        <Block className="h-12 w-full" />
        <Block className="h-12 w-full" />
        <Block className="h-28 w-full" />
        <Block className="h-12 w-48" />
      </div>
    </main>
  );
}
