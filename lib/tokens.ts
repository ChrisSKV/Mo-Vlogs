/**
 * Every value the copy needs that the client still owes us, in one place, so
 * launch day is one edit rather than a search across nine files.
 *
 * PLACEHOLDERS are deliberately loud ({LIKE_THIS}) so nothing ships looking
 * finished when it is not. See docs/build-challenge-spec.html §11-12.
 */

export const PRIZE = "$10,000";

/** No equity figure has ever been agreed against $10,000. The 10% was a
 *  working assumption that went with the old $50,000 cut, so asserting it in
 *  the rules would publish a term nobody signed off. null means the pages
 *  state the investment and leave the terms open until counsel has them. */
export const PRIZE_EQUITY: string | null = null;

/** Ring-fenced money unlocks the strong headline and the "already set aside"
 *  line. Until the client confirms, the page must not assert either.
 *  See spec §01 — this is the highest-return decision they can make. */
export const PRIZE_RING_FENCED = false;

/** The schedule is not agreed yet.
 *
 *  While this is false the countdown and every "entries close" line are
 *  hidden. That matters more than it sounds: the placeholder below has already
 *  passed, so with the countdown live the page greeted visitors with "Entries
 *  for Season 1 are closed" on a funnel that is open for business.
 *
 *  Flip this to true in the same edit that puts the real dates in, and keep
 *  CLOSE_AT in sync with CLOSE_DATE: the countdown reads CLOSE_AT and the copy
 *  reads CLOSE_DATE, and nothing checks that they agree. */
export const DATES_CONFIRMED = false;

/** PLACEHOLDER DATES. Nothing renders them while DATES_CONFIRMED is false. */
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
/** From the Federal Tax Authority certificate, and it must keep matching
 *  lib/sms-biz.ts and the carrier filing. */
export const LEGAL_ENTITY = process.env.NEXT_PUBLIC_LEGAL_ENTITY || "VIBES FAMILY FZCO";
export const LEGAL_ADDRESS =
  "Unit No 972, DMCC Business Centre, Level No 1, Jewellery & Gemplex 3, Dubai, United Arab Emirates";
/** Plausible stand-in so the page reads as finished in review. It follows the
 *  domain, so it changes when the domain is chosen. NOT yet a real mailbox. */
export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "movlogsagency@gmail.com";

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
