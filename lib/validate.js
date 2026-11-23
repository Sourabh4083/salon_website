// Shared by the forms and the API routes so both apply the same rules.

/** 10-digit Indian mobile number without +91 / 0 prefix, or null if invalid. */
export function normaliseMobile(value) {
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

export const PASSWORD_HINT = "At least 8 characters, with a letter and a number";

// Passwords that pass the letter + number rule but are still among the first
// things an attacker tries.
const COMMON_PASSWORDS = new Set([
  "password1", "password12", "password123", "password@123", "passw0rd", "p@ssw0rd",
  "abcd1234", "abc12345", "abc123456", "qwerty123", "qwerty12", "1q2w3e4r", "1qaz2wsx",
  "zaq12wsx", "iloveyou1", "welcome1", "welcome123", "admin123", "admin1234", "letmein1",
  "test1234", "india123", "india@123", "sachin123", "krishna123", "omsairam1", "asdf1234",
  "a1b2c3d4", "aa123456", "monkey123", "dragon123", "sunshine1", "princess1", "football1",
]);

/**
 * Returns a message saying what is wrong with the password, or null if it is
 * acceptable. `phone` lets us reject passwords built from the mobile number.
 */
export function passwordProblem(password, phone = "") {
  const pw = String(password || "");
  if (pw.length < 8) return "Password must be at least 8 characters";
  // bcrypt only looks at the first 72 bytes; anything longer is silently cut.
  if (new TextEncoder().encode(pw).length > 72) return "Password is too long (72 characters at most)";
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return "Password must contain a letter and a number";
  if (COMMON_PASSWORDS.has(pw.toLowerCase())) return "That password is too easy to guess. Please choose another";
  const digits = pw.replace(/\D/g, "");
  if (phone && digits.length >= 6 && phone.includes(digits)) {
    return "Please don't use your mobile number in your password";
  }
  return null;
}
