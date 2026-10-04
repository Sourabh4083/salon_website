// A slow, endlessly scrolling line of short facts. The list is printed twice
// so the loop has no seam; the second copy is hidden from screen readers.
// It pauses while a pointer is over it.
export default function Marquee({ items }) {
  if (!items?.length) return null;
  const row = (hidden) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <li key={item} className="flex items-center whitespace-nowrap">
          <span className="px-6 sm:px-8">{item}</span>
          <span className="h-1 w-1 rotate-45 bg-brand-2" aria-hidden="true" />
        </li>
      ))}
    </ul>
  );
  return (
    <div className="marquee overflow-hidden bg-ink py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85">
      <div className="marquee-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
