/* =============================================================================
   The business identity the carriers see.

   THIS BLOCK MUST MATCH THE TRUSTED CALLING FILING WORD FOR WORD. A reviewer
   compares the page to the profile, and a legal name or an address that does
   not match is a rejection, which costs the fee again.

   Source: the Federal Tax Authority Corporate Tax Registration Certificate
   (certificate 0000485986) the client sent on 25 Oct 2026, plus the DMCC
   licence listed on it. Nothing here is typed from memory.

   The entity is a UAE free zone company, not a US one, so there is no EIN.
   The carriers' "business registration number" for this filing is the DMCC
   licence number; the tax number is separate and is published alongside it the
   way a UAE company publishes both.
   ============================================================================= */

export const BIZ = {
  /** The A2P brand name, as filed. */
  brand: "Mo Vlogs",
  /** Legal Business Name on the compliance profile. */
  legal: "VIBES FAMILY FZCO",
  /** Free zone corporation, which is the entity type the filing asks for. */
  entityType: "Free zone (FZCO) corporation",
  /** Who issued the licence. */
  authority: "Dubai Multi Commodities Centre (DMCC) Free Zone",
  /** The licence number, which is what the carriers mean by registration number. */
  registration: "DMCC-749996",
  /** UAE Corporate Tax Registration Number. */
  trn: "100498182300001",
  address:
    "Unit No 972, DMCC Business Centre, Level No 1, Jewellery & Gemplex 3, Dubai, United Arab Emirates",
  country: "United Arab Emirates",
  /** Must be a mailbox somebody reads: the reviewer may write to it. */
  support: "movlogsagency@gmail.com",
  website: "movlogs.ai",
} as const;

/** True once every placeholder has been replaced. Guards the page. */
export function bizComplete(): boolean {
  return !JSON.stringify(BIZ).includes("{");
}
