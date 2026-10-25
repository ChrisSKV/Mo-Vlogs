// Close CRM lead delivery. Ported from the AICOM funnel, where it has been
// running against a live org, with the org-specific bits pulled out into env.
//
// No Zapier in the middle, on purpose. Zapier used to sit in front of GHL on
// another funnel and silently dropped phone numbers, which is why this writes
// direct and verifies what came back.
//
// Needs CLOSE_API_KEY. CLOSE_STATUS_ID is optional: leave it unset and Close
// uses the org's own default status. Never hardcode another org's status id
// here, the lead will land somewhere the dialers are not looking.

import type { Lead, DeliveryResult } from "./types";

const BASE = "https://api.close.com/api/v1";

// The lookup and the write get different leashes on purpose.
//
// The dedupe search is a nicety: if it is slow we can live without its answer.
// The write is the whole point, so it gets room to finish even when Close is
// having a bad minute. One shared 6s timeout used to cover both, which meant a
// slow search burned the budget the write needed.
const SEARCH_TIMEOUT = 4000;
const WRITE_TIMEOUT = 10000;
/** Ceiling on the whole search phase, across both lookups. */
const SEARCH_BUDGET = 6000;

// Close authenticates with the API key as the HTTP Basic username and an empty
// password.
function headers() {
  const auth = Buffer.from(`${process.env.CLOSE_API_KEY}:`).toString("base64");
  return {
    Authorization: `Basic ${auth}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

const digits = (s?: string) => (s || "").replace(/\D/g, "");

/** Last 8 digits match: survives Close reformatting the number. */
function phoneMatches(a?: string, b?: string): boolean {
  const da = digits(a);
  const db = digits(b);
  if (!da || !db) return false;
  if (da === db) return true;
  return da.length >= 8 && db.length >= 8 && da.slice(-8) === db.slice(-8);
}

type CloseContact = {
  emails?: { email?: string }[];
  phones?: { phone?: string }[];
};
type CloseLeadRecord = { id?: string; contacts?: CloseContact[] };

/**
 * Close does not de-duplicate on write (GHL does), so a repeat opt-in would
 * create a second lead and a setter would call the same person twice. Search
 * first and confirm the hit really carries this phone or email before trusting
 * it.
 *
 * Two lookups run back to back, so they share one budget: whatever the phone
 * search spends, the email search does not get.
 */
async function findExisting(lead: Lead): Promise<string | undefined> {
  const deadline = Date.now() + SEARCH_BUDGET;

  for (const term of [lead.phone, lead.email]) {
    if (!term) continue;
    const left = deadline - Date.now();
    if (left <= 0) break; // out of budget: the write matters more
    const res = await fetch(`${BASE}/lead/?query=${encodeURIComponent(term)}&_limit=5`, {
      headers: headers(),
      signal: AbortSignal.timeout(Math.min(SEARCH_TIMEOUT, left)),
    });
    if (!res.ok) continue; // search is best-effort; never block the write
    const j = (await res.json()) as { data?: CloseLeadRecord[] };
    for (const hit of j.data ?? []) {
      for (const c of hit.contacts ?? []) {
        const emailHit = (c.emails ?? []).some(
          (e) => (e.email || "").toLowerCase() === lead.email.toLowerCase(),
        );
        const phoneHit = (c.phones ?? []).some((p) => phoneMatches(lead.phone, p.phone));
        if (emailHit || phoneHit) return hit.id;
      }
    }
  }
  return undefined;
}

/**
 * Create the lead with its contact in one call. Close nests contacts (and their
 * emails and phones) inside the lead payload.
 *
 * The country goes on the lead ADDRESS, not just a text field: Close derives a
 * lead's local time from it, and calling Smart Views typically only show leads
 * whose local time is inside working hours. Without it those views silently
 * miss leads, which on a dialed funnel means nobody ever calls them.
 */
async function create(lead: Lead): Promise<string | undefined> {
  const name = `${lead.firstName} ${lead.lastName}`.trim();
  const statusId = process.env.CLOSE_STATUS_ID;
  const body: Record<string, unknown> = {
    name,
    ...(statusId ? { status_id: statusId } : {}),
    contacts: [
      {
        name,
        emails: [{ email: lead.email, type: "office" }],
        phones: [{ phone: lead.phone, type: "mobile" }],
      },
    ],
    ...(lead.countryCode ? { addresses: [{ country: lead.countryCode, label: "business" }] } : {}),
    // SMS consent goes in the description so it is visible on the lead without
    // a custom field. A setter must not text anyone this says NO for.
    description: [
      lead.source ? `Source: ${lead.source}` : "",
      lead.smsConsent === undefined ? "" : `SMS service: ${lead.smsConsent ? "YES" : "NO"}`,
      lead.smsMarketingConsent === undefined
        ? ""
        : `SMS marketing: ${lead.smsMarketingConsent ? "YES" : "NO"}`,
    ]
      .filter(Boolean)
      .join(" · "),
  };

  const res = await fetch(`${BASE}/lead/`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(WRITE_TIMEOUT),
  });
  if (!res.ok) throw new Error(`create ${res.status}: ${(await res.text()).slice(0, 200)}`);

  const j = (await res.json()) as CloseLeadRecord;

  // Close echoes the saved contacts, so the phone is verified from this same
  // response: no read-back round trip needed (unlike GHL).
  const savedPhone = j.contacts?.[0]?.phones?.[0]?.phone;
  if (!phoneMatches(lead.phone, savedPhone)) {
    console.error(`[close] lead ${j.id} created but phone did not echo back, check the record`);
  }
  return j.id;
}

/** Write the lead to Close. Never throws: a CRM failure must not lose a lead. */
export async function deliverToClose(lead: Lead): Promise<DeliveryResult> {
  if (!process.env.CLOSE_API_KEY) {
    return { destination: "close", ok: false, reason: "not-configured" };
  }
  // The dedupe search is best-effort, and that has to cover it throwing, not
  // just it answering with an error. It used to share the write's try/catch, so
  // a search that timed out aborted the whole delivery: the create was never
  // attempted and the lead never reached Close. A duplicate lead means a setter
  // calls someone twice. A missing lead means nobody calls them at all.
  let existing: string | undefined;
  try {
    existing = await findExisting(lead);
  } catch (e) {
    console.error(
      "[close] dedupe search failed, creating anyway:",
      e instanceof Error ? e.message : String(e),
    );
  }
  if (existing) return { destination: "close", ok: true, id: existing, duplicate: true };

  try {
    const id = await create(lead);
    if (!id) return { destination: "close", ok: false, reason: "no-lead-id" };
    return { destination: "close", ok: true, id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[close] deliver failed:", msg);
    return { destination: "close", ok: false, reason: msg.slice(0, 140) };
  }
}

/**
 * Put a note on the lead with this email.
 *
 * Used by the thank-you page's follow-up answers. A note rather than a custom
 * field on purpose: the setter opening the lead before they dial reads the
 * activity feed, and a field they have to go looking for is a field nobody
 * reads. Throws, because the caller decides what a failure costs.
 */
export async function noteOnLead(email: string, note: string): Promise<void> {
  if (!process.env.CLOSE_API_KEY) throw new Error("not-configured");

  const res = await fetch(`${BASE}/lead/?query=${encodeURIComponent(email)}&_limit=1`, {
    headers: headers(),
    signal: AbortSignal.timeout(SEARCH_TIMEOUT),
  });
  if (!res.ok) throw new Error(`lead search ${res.status}`);
  const j = (await res.json()) as { data?: { id?: string }[] };
  const leadId = j.data?.[0]?.id;
  if (!leadId) throw new Error("lead-not-found");

  const post = await fetch(`${BASE}/activity/note/`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ lead_id: leadId, note }),
    signal: AbortSignal.timeout(WRITE_TIMEOUT),
  });
  if (!post.ok) throw new Error(`note ${post.status}: ${(await post.text()).slice(0, 120)}`);
}
