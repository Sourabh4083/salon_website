import Image from "next/image";
import { site } from "@/lib/site";

// Both files are cut from /public/images/logo.png: the badge is the whole
// hexagon with the paper around it removed, the mark is the two faces alone.

/** The full hexagon logo. It carries its own white fill, so it sits on any background. */
export function LogoBadge({ className = "", priority = false, sizes = "160px" }) {
  return (
    <Image
      src="/images/logo-badge.png"
      alt={site.name}
      width={551}
      height={640}
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}

/** The two faces on a transparent background. For light backgrounds only. */
export function LogoMark({ className = "", priority = false, sizes = "48px" }) {
  return (
    <Image
      src="/images/logo-mark.png"
      alt=""
      width={265}
      height={320}
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}
