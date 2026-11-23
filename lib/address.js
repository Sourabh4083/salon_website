// Delivery addresses: one set of rules shared by the forms and the API routes,
// so the browser and the server always agree on what a complete address is.
// Fields follow what Indian couriers ask for on a shipping label.

import { normaliseMobile } from "@/lib/validate";

export const MAX_ADDRESSES = 5;

// 28 states and 8 union territories.
export const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

export const ADDRESS_TYPES = ["home", "work"];

export const EMPTY_ADDRESS = {
  name: "",
  phone: "",
  altPhone: "",
  line1: "",
  line2: "",
  landmark: "",
  pincode: "",
  city: "",
  state: "",
  type: "home",
};

const squash = (s) => String(s || "").toLowerCase().replace(/&/g, "and").replace(/[^a-z]/g, "");

// Older or alternative spellings the PIN code data uses.
const STATE_ALIASES = {
  chattisgarh: "Chhattisgarh",
  orissa: "Odisha",
  pondicherry: "Puducherry",
  newdelhi: "Delhi",
  nctofdelhi: "Delhi",
  uttaranchal: "Uttarakhand",
  dadraandnagarhaveli: "Dadra and Nagar Haveli and Daman and Diu",
  damananddiu: "Dadra and Nagar Haveli and Daman and Diu",
  andamanandnicobarislands: "Andaman and Nicobar Islands",
  andamanandnicobar: "Andaman and Nicobar Islands",
};

/** The matching entry of INDIAN_STATES, or "" if `name` is not one. */
export function matchState(name) {
  const key = squash(name);
  if (!key) return "";
  return INDIAN_STATES.find((s) => squash(s) === key) || STATE_ALIASES[key] || "";
}

/** 6 digits, first one 1-9 (Indian PIN codes never start with 0). */
export function isValidPincode(value) {
  return /^[1-9]\d{5}$/.test(String(value || ""));
}

const text = (v, max) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);

/**
 * Validates and tidies an address from a form or request body.
 * Returns { data } or { error, field } where `field` names the bad input.
 */
export function cleanAddress(input) {
  const a = input || {};
  const data = {
    name: text(a.name, 80),
    phone: normaliseMobile(a.phone) || "",
    altPhone: "",
    line1: text(a.line1, 120),
    line2: text(a.line2, 120),
    landmark: text(a.landmark, 80),
    pincode: String(a.pincode || "").replace(/\D/g, "").slice(0, 6),
    city: text(a.city, 60),
    state: matchState(a.state),
    type: ADDRESS_TYPES.includes(a.type) ? a.type : "home",
  };

  if (data.name.length < 2) return { error: "Enter the name of the person receiving the parcel", field: "name" };
  if (!data.phone) return { error: "Enter a valid 10-digit mobile number", field: "phone" };
  if (text(a.altPhone, 20)) {
    data.altPhone = normaliseMobile(a.altPhone) || "";
    if (!data.altPhone) return { error: "Enter a valid alternate mobile number, or leave it empty", field: "altPhone" };
  }
  if (data.line1.length < 3) return { error: "Enter your house / flat number and building", field: "line1" };
  if (data.line2.length < 3) return { error: "Enter your street, area or locality", field: "line2" };
  if (!isValidPincode(data.pincode)) return { error: "Enter a valid 6-digit PIN code", field: "pincode" };
  if (data.city.length < 2) return { error: "Enter your city or district", field: "city" };
  if (!data.state) return { error: "Choose your state", field: "state" };

  return { data };
}

/** Address lines (without name and phone), for display and shipping labels. */
export function addressLines(a) {
  if (!a) return [];
  return [
    a.line1,
    a.line2,
    a.landmark ? `Landmark: ${a.landmark}` : "",
    [a.city, a.state].filter(Boolean).join(", ") + (a.pincode ? ` - ${a.pincode}` : ""),
  ].filter(Boolean);
}

/** The full label: name, address lines, phone numbers. One item per line. */
export function shippingLabel(a) {
  if (!a) return "";
  const phones = [a.phone, a.altPhone].filter(Boolean).map((p) => `+91 ${p}`).join(" / ");
  return [a.name, ...addressLines(a), phones ? `Mobile: ${phones}` : ""].filter(Boolean).join("\n");
}

/** The address book as the client sees it, default address first. */
export function publicAddresses(user) {
  return (user.addresses || [])
    .map((a) => ({
      id: String(a._id),
      name: a.name,
      phone: a.phone,
      altPhone: a.altPhone || "",
      line1: a.line1,
      line2: a.line2,
      landmark: a.landmark || "",
      pincode: a.pincode,
      city: a.city,
      state: a.state,
      type: a.type || "home",
      isDefault: Boolean(a.isDefault),
    }))
    .sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
}
