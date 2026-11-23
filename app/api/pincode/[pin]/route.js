import { NextResponse } from "next/server";
import { isValidPincode, matchState } from "@/lib/address";

// GET /api/pincode/452001 -> { found: true, city, state, areas: [...] }
//
// Looks the PIN code up in India Post's public directory so the address form
// can fill in city and state, and catch PIN codes that don't exist. Proxied
// through here (instead of called from the browser) so results are cached and
// the lookup is cut short if India Post is slow.
//
// { found: false } means India Post says the PIN code doesn't exist.
// A 503 means the lookup itself failed: the form then lets the customer type
// city and state by hand rather than blocking the order.
export async function GET(_req, { params }) {
  const { pin } = await params;
  if (!isValidPincode(pin)) {
    return NextResponse.json({ found: false });
  }

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`, {
      signal: AbortSignal.timeout(5000),
      // PIN codes almost never change; cache each one for a week.
      next: { revalidate: 60 * 60 * 24 * 7 },
    });
    if (!res.ok) throw new Error(`India Post responded ${res.status}`);

    const [result] = await res.json();
    const offices = Array.isArray(result?.PostOffice) ? result.PostOffice : [];
    if (result?.Status !== "Success" || offices.length === 0) {
      return NextResponse.json({ found: false });
    }

    // Prefer offices that actually deliver; their district is the city.
    const delivering = offices.filter((o) => o.DeliveryStatus === "Delivery");
    const main = delivering[0] || offices[0];
    const areas = [...new Set(offices.map((o) => String(o.Name || "").trim()).filter(Boolean))].slice(0, 30);

    return NextResponse.json(
      {
        found: true,
        city: String(main.District || main.Block || "").trim(),
        state: matchState(main.State),
        areas,
      },
      { headers: { "Cache-Control": "public, max-age=86400" } }
    );
  } catch (err) {
    console.warn("PIN code lookup failed:", pin, err.message);
    return NextResponse.json({ error: "Lookup unavailable" }, { status: 503 });
  }
}
