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
  // The shop's own Google Maps listing: `mapUrl` opens it, `mapEmbed` is the
  // src of the iframe from Maps > Share > Embed a map.
  mapUrl: "https://www.google.com/maps?cid=5435197922534450881",
  mapEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3326.2274244926316!2d81.63532296737043!3d21.255521077878615!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a28ddff9c087913%3A0x4b6db3b6b09b66c1!2sBLUE%20HEAVEN%20-%20Wig%20hub%20%26%20Unisex%20Salon!5e1!3m2!1sen!2sin!4v1791118521594!5m2!1sen!2sin",
  hours: [{ days: "Every day", time: "10:00 am to 8:00 pm" }],
  instagram: "",

  gstin: "22HKQPK6687C1ZQ",
  // Prices entered in admin already include GST at this rate.
  gstRate: 0.18,

  shipping: { freeAt: 999, fee: 49 },

  // TODO: one sentence each, shown on product pages when filled in.
  returnsText: "",
  deliveryText: "",

  // Photos of the shop, under /public/images. A path under /public or a
  // Cloudinary URL. If one is emptied, the newest matching product photo is used.
  images: {
    hero: "/images/1 image.png",
    men: "/images/men image.png",
    women: "/images/woman image.png",
    salon: "/images/salon-hero.jpg",
  },

  // Shown in the photo gallery on the home and salon pages, never in the
  // product catalog. `salon: true` photos also appear on the salon page.
  gallery: [
    { src: "/images/wig-ombre-blonde.jpg", alt: "Ombré blonde wig on display", width: 960, height: 1280 },
    { src: "/images/salon-floor-1.jpg", alt: "Stylists working with clients on the salon floor", width: 1280, height: 960, salon: true },
    { src: "/images/haircut.jpg", alt: "Stylist cutting a client's hair", width: 960, height: 1280, salon: true },
    { src: "/images/wig-emerald.jpg", alt: "Emerald ombré wig", width: 960, height: 1280 },
    { src: "/images/brand-wall.jpg", alt: "Blue Heaven branded wall inside the salon", width: 1599, height: 899, salon: true },
    { src: "/images/hair-patch.jpg", alt: "Hair patch being measured for a client", width: 960, height: 1280, salon: true },
    { src: "/images/salon-floor-2.jpg", alt: "Styling stations inside the salon", width: 1280, height: 960, salon: true },
    { src: "/images/products.jpg", alt: "Professional hair and skin products on the shelves", width: 960, height: 1280, salon: true },
    { src: "/images/pedicure-corner.jpg", alt: "Pedicure and manicure corner", width: 1280, height: 960, salon: true },
  ],

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
