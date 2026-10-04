// Everything specific to this business lives here. To reuse the project for
// another store, this file and lib/wig.js are the two to edit.
//
// Fields marked TODO are empty until the real details are supplied. The UI
// hides anything that is empty (no phone button without a phone number), so
// nothing made-up is ever shown to customers.

export const site = {
  name: "Blue Heaven Wighub & Unisex Salon",
  shortName: "Blue Heaven Wighub",
  wordmark: "Blue Heaven",
  strapline: "Wighub & Unisex Salon",
  tagline: "Natural-looking wigs for men and women",
  description:
    "Blue Heaven Wighub & Unisex Salon: human hair and synthetic wigs, hair patches and toppers for men and women, with fitting and styling at our salon.",

  // Change this in one place when a custom domain is attached.
  url: "https://blue-heaven-wighub.vercel.app",

  // `whatsapp` is digits only with country code; `phone` is how it is displayed.
  phone: "+91 89623 79721",
  whatsapp: "918962379721",
  address: "Station Road, Fafadih Chowk\nAbove Mahaveer Thali\nRaipur, Chhattisgarh",
  // Opens a Google Maps search for the address. Replace with the shop's own
  // Maps share link once it has a listing.
  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=Blue+Heaven+Wighub+Station+Road+Fafadih+Chowk+Raipur+Chhattisgarh",
  hours: [{ days: "Every day", time: "10:00 am to 8:00 pm" }],
  instagram: "",

  gstin: "22HKQPK6687C1ZQ",
  // Prices entered in admin already include GST at this rate.
  gstRate: 0.18,

  shipping: { freeAt: 999, fee: 49 },

  // TODO: one sentence each, shown on product pages when filled in.
  returnsText: "",
  deliveryText: "",

  // TODO: real photos. A path under /public (for example "/hero.jpg") or a
  // Cloudinary URL. Until set, the newest matching product photo is used.
  images: { hero: "", men: "", women: "", salon: "" },

  // TODO: confirm the list and add prices. A null price shows "On request".
  salonServices: [
    {
      group: "Wig services",
      items: [
        { name: "Wig consultation and fitting", price: null, duration: "" },
        { name: "Hair patch fixing", price: null, duration: "" },
        { name: "Wig cut and styling", price: null, duration: "" },
        { name: "Wig wash and service", price: null, duration: "" },
      ],
    },
    {
      group: "Hair",
      items: [
        { name: "Haircut", price: null, duration: "" },
        { name: "Hair colour", price: null, duration: "" },
        { name: "Hair spa", price: null, duration: "" },
        { name: "Blow dry and styling", price: null, duration: "" },
      ],
    },
    {
      group: "Grooming",
      items: [
        { name: "Beard trim and shape", price: null, duration: "" },
        { name: "Shave", price: null, duration: "" },
        { name: "Facial and clean-up", price: null, duration: "" },
      ],
    },
  ],
};

export const gstPercent = Math.round(site.gstRate * 100);

/** wa.me link with a prefilled message, or null when no number is set. */
export function whatsappLink(message = "") {
  if (!site.whatsapp) return null;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${site.whatsapp}${text}`;
}

/** tel: link, or null when no phone is set. */
export function phoneLink() {
  if (!site.phone) return null;
  return `tel:${site.phone.replace(/[^\d+]/g, "")}`;
}
