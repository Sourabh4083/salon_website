import Image from "next/image";

// Photos of the shop itself, laid out at their own proportions so nothing
// is cropped. These are never mixed into the product catalog.
export default function ShopGallery({ photos }) {
  if (!photos?.length) return null;
  return (
    <div className="mt-8 columns-2 gap-4 md:columns-3 sm:gap-5">
      {photos.map((photo) => (
        <div key={photo.src} className="mb-4 break-inside-avoid overflow-hidden bg-slate-100 sm:mb-5">
          <Image
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            sizes="(max-width: 768px) 50vw, 33vw"
            className="h-auto w-full"
          />
        </div>
      ))}
    </div>
  );
}
