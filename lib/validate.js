// Shared by the forms and the API routes so both apply the same rules.

export const USERNAME_HINT = "3 to 20 characters: letters, numbers and underscore";

/** Lower-cased username, or null if it breaks the rules. */
export function normaliseUsername(value) {
  const username = String(value || "").trim().toLowerCase();
  return /^[a-z0-9_]{3,20}$/.test(username) ? username : null;
}

/** 10-digit Indian mobile number without +91 / 0 prefix, or null if invalid. */
export function normaliseMobile(value) {
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}
