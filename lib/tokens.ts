/**
 * Every value the copy needs that the client still owes us, in one place, so
 * launch day is one edit rather than a search across nine files.
 *
 * PLACEHOLDERS are deliberately loud ({LIKE_THIS}) so nothing ships looking
 * finished when it is not. See docs/build-challenge-spec.html §11-12.
 */

export const PRIZE = "$50,000";
export const PRIZE_EQUITY = "10%";

/** Ring-fenced money unlocks the strong headline and the "already set aside"
 *  line. Until the client confirms, the page must not assert either.
 *  See spec §01 — this is the highest-return decision they can make. */
export const PRIZE_RING_FENCED = false;

/** PLACEHOLDER DATES, real-looking so the page and the countdown can be shown
 *  to the client. Swap all three for the real schedule before launch, and keep
 *  CLOSE_AT in sync with CLOSE_DATE: the countdown reads CLOSE_AT and the copy
 *  reads CLOSE_DATE, and nothing checks that they agree. */
export const CLOSE_DATE = "5 October";
export const CLOSE_AT = "2026-10-05T20:00:00+04:00"; // 8pm Dubai
/** When entries opened. Only used to draw how much of the window has run. */
export const OPEN_AT = "2026-09-15T09:00:00+04:00";
/** The counter stays hidden until entries reach this. A truthful "31 people
 *  have entered" on launch hour is worse than no counter, and inflating it is
 *  exactly what this page cannot afford to be caught doing. */
export const ENTRY_COUNT_FLOOR = 250;
export const SHORTLIST_DATE = "12 October";
export const FINAL_DATE = "14 November";

export const COMPANY = process.env.NEXT_PUBLIC_COMPANY_NAME || "The Build Challenge";
export const LEGAL_ENTITY = process.env.NEXT_PUBLIC_LEGAL_ENTITY || "{LEGAL_ENTITY_NAME}";
export const LEGAL_ADDRESS = "{REGISTERED_ADDRESS}, Dubai, UAE";
/** Plausible stand-in so the page reads as finished in review. It follows the
 *  domain, so it changes when the domain is chosen. NOT yet a real mailbox. */
export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@thebuildchallenge.com";

/** Flips confirmation copy from email-only to SMS/WhatsApp. Sender-ID
 *  registration (TDRA / CITC / DLT / 10DLC) is a multi-week process, so day
 *  one is email and this is a config change, not a redeploy. Spec §00 f.05. */
export const MESSAGING: "email" | "sms" | "whatsapp" =
  (process.env.NEXT_PUBLIC_MESSAGING_CHANNEL as "email" | "sms" | "whatsapp") || "email";

/** The scoring rubric. Published identically here, on the landing page and on
 *  /rules — a competition judged on pre-published objective criteria is a
 *  skill contest; the same thing judged on vibes is a lottery. */
export const RUBRIC = [
  { label: "Does it work?", weight: 30 },
  { label: "Does anyone actually use it?", weight: 30 },
  { label: "Is it a business, not a demo?", weight: 25 },
  { label: "Did you build it yourself?", weight: 15 },
] as const;

export const JUDGES = ["{JUDGE_1}", "{JUDGE_2}", "{JUDGE_3}"] as const;

/** Territories. Excluding UK/EEA removes the single largest regulatory
 *  exposure (DMCC direct CMA fines, CAP 8.17, GDPR representative, TPS with a
 *  28-day lead time) for roughly 2-4% of leads. Spec §12. */
export const EXCLUDED_TERRITORIES = "the UK and EU";
