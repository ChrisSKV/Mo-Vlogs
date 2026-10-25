// ONE source of truth for lead-field validation, used by the form (client) and
// the API route (server) so the two can never drift apart.
//
// The email rule is strict on purpose. GHL rejects anything that is not a real
// address and drops the whole lead, so we must never let one through:
//   - local part: dot-separated atoms (no leading, trailing, or doubled dots)
//   - domain: real labels (no doubled dots, no leading/trailing hyphen)
//   - TLD: letters only, 2+
// This rejects the junk that actually reached us on AICOM: "name@gmail..com"
// (doubled dot) and "name@gmail.com5-Day" (junk appended to the TLD).
const EMAIL_RE =
  /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;

export function isValidEmail(value: string): boolean {
  const s = (value || "").trim();
  if (!s || s.length > 254) return false;
  return EMAIL_RE.test(s);
}

/** A real name: at least 2 characters and contains an actual letter. */
export function isValidName(value: string): boolean {
  const s = (value || "").trim();
  return s.length >= 2 && /\p{L}/u.test(s);
}

/**
 * Split whatever the form collected into a first and last name.
 *
 * Plenty of Christian's forms collect a single "name" field. Close and GHL both
 * want the two separately, and a lead whose last name is empty reads as broken
 * in a dialer's list, so fall back to a single dot rather than an empty string.
 */
export function splitName(full: string): { firstName: string; lastName: string } {
  const parts = (full || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "." };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}
