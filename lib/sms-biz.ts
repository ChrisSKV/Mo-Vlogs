/* =============================================================================
   The business identity the carriers see.

   THIS BLOCK MUST MATCH THE TRUSTED CALLING FILING WORD FOR WORD. A reviewer
   compares the page to the profile, and a legal name or an address that does
   not match is a rejection, which costs the fee again.

   Source: the DMCC trade licence (licence DMCC-749996, expires 21 Dec 2026),
   which is the document the carrier's provider verifies against. Nothing here
   is typed from memory.

   THE FIRST FILING WAS REJECTED FOR EXACTLY THIS. It was built from the
   Federal Tax Authority certificate, which names the company VIBES FAMILY
   FZCO at Unit 972, while the trade licence names it VIBES FAMILY DMCC at
   Unit 691. The carrier checks the licence, so the licence wins. If the two
   documents ever disagree again, the licence is the one to copy.

   The entity is a UAE free zone company, not a US one, so there is no EIN.
   The carriers' "business registration number" for this filing is the DMCC
   licence number; the tax number is separate and is published alongside it the
   way a UAE company publishes both.
   ============================================================================= */

export const BIZ = {
  /** The A2P brand name, as filed. */
  brand: "Mo Vlogs",
  /** Legal Business Name on the compliance profile. */
  legal: "VIBES FAMILY DMCC",
  /** "Legal Status" on the licence, word for word. */
  entityType: "Free Zone Company",
  /** Who issued the licence. */
  authority: "Dubai Multi Commodities Centre (DMCC) Free Zone",
  /** The licence number, which is what the carriers mean by registration number. */
  registration: "DMCC-749996",
  /** The separate registration number printed on the same licence. */
  registrationNumber: "DMCC180154",
  /** UAE Corporate Tax Registration Number. */
  trn: "100498182300001",
  address:
    "Unit No 691, DMCC Business Centre, Level No 1, Jewellery & Gemplex 3, Dubai, United Arab Emirates",
  country: "United Arab Emirates",
  /** Must be a mailbox somebody reads: the reviewer may write to it, and it
   *  must be on movlogs.ai. The 2026-11-20 rejection named this Gmail address
   *  by name. checkSupportEmail() below refuses it, so
   *  `node scripts/check-sms-identity.mjs` fails until there is a real
   *  support@movlogs.ai mailbox. STILL OPEN as of 2026-11-21. */
  support: "support@movlogs.ai",
  website: "movlogs.ai",
} as const;

/* -----------------------------------------------------------------------------
   The guard. The /sms page prints every problem it finds and refuses to read as
   ready, and scripts/check-sms-identity.mjs exits non-zero on the same list, so
   a half-filled identity cannot reach a reviewer.
   -------------------------------------------------------------------------- */

/** Mailboxes a carrier reviewer treats as "this is not a business". */
const FREE_MAIL = [
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.uk", "ymail.com",
  "hotmail.com", "hotmail.co.uk", "outlook.com", "live.com", "msn.com",
  "icloud.com", "me.com", "mac.com", "aol.com", "proton.me", "protonmail.com",
  "gmx.com", "gmx.de", "mail.com", "yandex.com", "yandex.ru", "zoho.com",
  "qq.com", "163.com", "mail.ru", "inbox.com", "fastmail.com", "tutanota.com",
];

/** Addresses that are obviously still the template. */
const PLACEHOLDER_MAIL = [
  "example.com", "example.org", "domain.com", "yourdomain.com", "mysite.com",
  "test.com", "email.com", "changeme", "placeholder", "yourbrand", "clientname",
];

/** The last two labels of a host, so a funnel on join.brand.com may use a
 *  mailbox on brand.com. Two-part public suffixes (.co.uk) would need a real
 *  suffix list; if a client is on one, check that pair by hand. */
function registrable(host: string): string {
  const p = host.toLowerCase().replace(/\.$/, "").split(".");
  return p.length <= 2 ? p.join(".") : p.slice(-2).join(".");
}

/** Every reason this identity is not fit to file. Empty means it is. */
export function bizProblems(): string[] {
  const out: string[] = [];

  for (const [k, v] of Object.entries(BIZ)) {
    if (typeof v !== "string") continue;
    if (!v.trim()) out.push(`${k} is empty.`);
    else if (/[{}]/.test(v)) out.push(`${k} is still the placeholder: ${v}`);
  }

  const site = BIZ.website.toLowerCase();
  if (/^https?:|\/|\s/.test(site)) {
    out.push(`website must be a bare host with no protocol and no slash, got: ${BIZ.website}`);
  }

  out.push(...checkSupportEmail(BIZ.support, site));
  return out;
}

/** The email rule on its own, so the script and the page cannot disagree. */
export function checkSupportEmail(raw: string, site: string): string[] {
  const email = (raw || "").trim().toLowerCase();
  const out: string[] = [];

  if (!email) return ["support email is empty. Nothing may be filed without a mailbox."];
  if (/[{}]/.test(email) || /\s/.test(email)) {
    return [`support email is still the placeholder: ${raw}`];
  }
  if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/.test(email)) {
    return [`support email is not a valid address: ${raw}`];
  }

  const domain = email.split("@")[1];

  if (PLACEHOLDER_MAIL.some((p) => email.includes(p))) {
    out.push(`support email is a template address, not a real mailbox: ${raw}`);
  }
  if (FREE_MAIL.includes(domain)) {
    out.push(
      `support email is on a free provider (${domain}). The carrier rejects it. ` +
        `Create a mailbox on ${site || "the site's own domain"} and use that.`,
    );
  }
  if (site && !/[{}]/.test(site) && registrable(domain) !== registrable(site)) {
    out.push(
      `support email domain (${domain}) is not the site's domain (${site}). ` +
        `A reviewer checks that the contact belongs to the business that owns the page.`,
    );
  }
  return out;
}

/** Kept for the pages: true once there is nothing left to fix. */
export function bizComplete(): boolean {
  return bizProblems().length === 0;
}
