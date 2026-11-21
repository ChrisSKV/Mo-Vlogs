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
  /** Must be a mailbox somebody reads: the reviewer may write to it. It must
   *  ALSO be on the website's own domain: the 2026-11-20 rejection named the
   *  Gmail address. Every page reads it from here, so this is the one edit. */
  support: "movlogsagency@gmail.com",
  website: "movlogs.ai",
} as const;

/** True once every placeholder has been replaced. Guards the page.
 *  Checks the VALUES, not the serialised object: JSON.stringify always starts
 *  with a brace, so stringifying it reported every filled-in identity as
 *  incomplete and printed the warning on a page that was ready. */
export function bizComplete(): boolean {
  return !Object.values(BIZ).some((v) => typeof v === "string" && v.includes("{"));
}
