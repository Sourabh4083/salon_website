import { site } from "@/lib/site";

// The shop's Google Maps listing. Renders nothing until an embed URL is set.
export default function ShopMap({ className = "" }) {
  if (!site.mapEmbed) return null;
  return (
    <div className={`relative overflow-hidden border border-line bg-slate-100 ${className}`}>
      <iframe
        src={site.mapEmbed}
        title={`${site.name} on Google Maps`}
        className="absolute inset-0 h-full w-full"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
