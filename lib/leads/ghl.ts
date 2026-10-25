import type { Lead, DeliveryResult } from "./types";

// Direct-to-GoHighLevel contact write with VERIFY + RETRY.
//
// Why this exists: the Zapier "Add/Update Contact" step occasionally reported
// success but didn't persist the phone, so leads reached the team with no number
// to call. Zapier is fire-and-forget. This writes the contact, then reads it back
// to confirm the phone actually saved, and rewrites if it didn't , a guarantee
// Zapier can't give.
//
// Fail-open by design: every function is wrapped by the caller so a GHL outage
// never blocks a lead. Needs GHL_API_KEY + GHL_LOCATION_ID (see .env.local).

const BASE = "https://services.leadconnectorhq.com";
const VERSION = "2021-07-28";
const TIMEOUT = 6000;

// Optional GHL custom field holding the traffic source (utm value, e.g.
// "facebook"). Every location has its own field id, so this is env-only: when
// it is unset we simply do not write the custom field. Never inherit another
// client's id here, GHL rejects the whole upsert for an unknown field.
const TRAFFIC_SOURCE_FIELD_ID = process.env.GHL_TRAFFIC_SOURCE_FIELD_ID || "";

function headers() {
  return {
    Authorization: `Bearer ${process.env.GHL_API_KEY}`,
    Version: VERSION,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

export type GhlLead = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string; // E.164, already validated upstream
  country?: string; // 2-letter ISO (countryCode)
  source?: string;
  tags?: string[];
};

export type GhlResult = {
  ok: boolean; // did we get a contact id at all
  contactId?: string;
  phoneSaved: boolean; // did the phone verify on read-back
  /** false when the contact saved but its tags did not. Not a lost lead. */
  tagsSaved?: boolean;
  reason?: string;
  // Returning lead: the phone already belongs to another contact and the
  // location blocks duplicates, so it can't attach here. Not a failure, the
  // number is safely on the earlier contact (existingContactId).
  duplicatePhone?: boolean;
  existingContactId?: string;
};

// GHL stores phones in E.164 and normalizes them (it drops national trunk zeros
// and reformats), so the read-back rarely equals what we sent digit-for-digit
// (e.g. we send +598 097 124 300, GHL stores +598 97 124 300). Treat the phone as
// saved when GHL has a non-empty number whose national part (last 8 digits)
// matches ours. This stops the false "phone did NOT verify" alerts and the
// pointless rewrites they cause, while still catching the real failure: an empty
// phone on the record.
const digits = (s?: string) => (s || "").replace(/\D/g, "");
function phoneMatches(a?: string, b?: string): boolean {
  const da = digits(a);
  const db = digits(b);
  if (!da || !db) return false; // empty on either side = not really saved
  if (da === db) return true; // exact
  return da.length >= 8 && db.length >= 8 && da.slice(-8) === db.slice(-8);
}

async function upsert(lead: GhlLead): Promise<{ id?: string; phone?: string }> {
  const body: Record<string, unknown> = {
    locationId: process.env.GHL_LOCATION_ID,
    firstName: lead.firstName,
    lastName: lead.lastName,
    name: `${lead.firstName} ${lead.lastName}`.trim(),
    email: lead.email,
    phone: lead.phone,
    ...(lead.country ? { country: lead.country } : {}),
    /* NO tags here. GHL's upsert REPLACES the tag list with whatever it is
       given, it does not merge, so sending the funnel's tags on a returning
       lead's second opt-in wipes every tag added since the first one,
       including "do not call". Tags go through the add-only endpoint below.
       Caught on the live account: a second opt-in stripped "under 18" and
       "do not call" off a contact that had answered under 18. */
    // Traffic Source custom field, only when this location has one configured
    ...(lead.source && TRAFFIC_SOURCE_FIELD_ID
      ? { customFields: [{ id: TRAFFIC_SOURCE_FIELD_ID, value: lead.source }] }
      : {}),
  };
  const post = (b: Record<string, unknown>) =>
    fetch(`${BASE}/contacts/upsert`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(b),
      signal: AbortSignal.timeout(TIMEOUT),
    });

  let res = await post(body);
  // GHL rejects some phone-derived country ISO codes (e.g. deprecated ones) with
  // "country must be valid" and drops the WHOLE lead. Country is optional here, so
  // retry once without it rather than lose the lead.
  if (!res.ok && res.status === 422 && lead.country) {
    const text = await res.text();
    if (/country/i.test(text)) {
      delete body.country;
      res = await post(body);
    } else {
      throw new Error(`upsert 422: ${text.slice(0, 200)}`);
    }
  }
  if (!res.ok) throw new Error(`upsert ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const j = await res.json();
  const c = j.contact ?? j;
  return { id: c?.id, phone: c?.phone };
}

async function readPhone(id: string): Promise<string | undefined> {
  const res = await fetch(`${BASE}/contacts/${id}`, {
    headers: headers(),
    signal: AbortSignal.timeout(TIMEOUT),
  });
  if (!res.ok) return undefined;
  const j = await res.json();
  return (j.contact ?? j)?.phone;
}

// Returns whether the phone wrote, and if it was blocked by GHL's no-duplicates
// rule, the id of the contact that already owns this phone.
async function writePhone(
  id: string,
  phone: string,
): Promise<{ ok: boolean; duplicate?: boolean; existingId?: string }> {
  const res = await fetch(`${BASE}/contacts/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({ phone }),
    signal: AbortSignal.timeout(TIMEOUT),
  });
  if (res.ok) return { ok: true };
  let j: { message?: string; meta?: { matchingField?: string; contactId?: string } } = {};
  try {
    j = await res.json();
  } catch {
    /* non-JSON error body */
  }
  const duplicate =
    res.status === 400 && /duplicat/i.test(j.message || "") && j.meta?.matchingField === "phone";
  return { ok: false, duplicate, existingId: j.meta?.contactId };
}

/** Upsert the contact, then guarantee the phone is on the record. */
export async function deliverToGHL(lead: GhlLead): Promise<GhlResult> {
  if (!process.env.GHL_API_KEY || !process.env.GHL_LOCATION_ID) {
    return { ok: false, phoneSaved: false, reason: "not-configured" };
  }
  try {
    const { id, phone } = await upsert(lead);
    if (!id) return { ok: false, phoneSaved: false, reason: "no-contact-id" };

    // Additive, so a returning lead keeps everything the funnel learned about
    // them. Never fatal: the contact exists and is callable without its tags,
    // but the line is loud because in a shared sub-account the tag is the only
    // thing saying WHICH funnel this lead came from.
    let tagsSaved = true;
    if (lead.tags?.length) {
      try {
        await addTags(id, lead.tags);
      } catch (e) {
        tagsSaved = false;
        console.error("[ghl] tags not applied to", id, e instanceof Error ? e.message : e);
      }
    }

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    // Fast path: the upsert response already echoes a matching phone, so it's
    // saved and we never need a read-back (this covers most leads).
    let saved = phoneMatches(lead.phone, phone);

    // GHL's GET is eventually-consistent: right after an upsert the phone often
    // isn't returned yet, which produced FALSE "phone did NOT verify" alerts. So
    // before rewriting anything, wait and re-read once , that clears the race
    // without a pointless rewrite.
    if (!saved) {
      await sleep(500);
      saved = phoneMatches(lead.phone, await readPhone(id));
    }

    // Only now, if the phone is genuinely missing/different, rewrite it , the
    // whole reason this exists: catch the silent "success but phone didn't stick"
    // case Zapier couldn't. Up to two rewrites with time to index between them.
    // If GHL blocks the write because the phone already belongs to another
    // contact (returning lead + no-duplicates rule), stop: it's not a failure.
    let duplicatePhone = false;
    let existingContactId: string | undefined;
    for (let i = 0; i < 2 && !saved; i++) {
      const w = await writePhone(id, lead.phone);
      if (w.duplicate) {
        duplicatePhone = true;
        existingContactId = w.existingId;
        break;
      }
      await sleep(600);
      saved = phoneMatches(lead.phone, await readPhone(id));
    }

    return { ok: true, contactId: id, phoneSaved: saved, tagsSaved, duplicatePhone, existingContactId };
  } catch (e) {
    // surface the real GHL failure (e.g. "upsert 422: email invalid") so the
    // Slack alert says WHY, instead of a useless generic "error".
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[ghl] deliver failed:", msg);
    return { ok: false, phoneSaved: false, reason: msg.slice(0, 140) };
  }
}

// Adapter wrapper so the dispatcher can treat GHL like every other destination.
// The phone-verification detail stays available on the raw result for callers
// that care (the route logs it), but the common shape is what gets aggregated.
export async function deliverToGhlDestination(lead: Lead): Promise<DeliveryResult> {
  const r = await deliverToGHL({
    firstName: lead.firstName,
    lastName: lead.lastName,
    email: lead.email,
    phone: lead.phone,
    country: lead.countryCode,
    source: lead.source,
    tags: [
      ...(process.env.GHL_TAGS ? process.env.GHL_TAGS.split(",").map((t) => t.trim()) : []),
      ...(lead.smsConsent === undefined
        ? []
        : [lead.smsConsent ? "sms consent" : "no sms consent"]),
    ].filter(Boolean),
  });

  // A returning lead whose phone already sits on an earlier contact is NOT a
  // failure: the number is safely on that contact. Report it as a duplicate so
  // nobody gets paged for a repeat opt-in.
  if (r.ok && !r.phoneSaved && r.duplicatePhone) {
    return { destination: "ghl", ok: true, id: r.contactId, duplicate: true };
  }
  // Created, but the phone genuinely did not stick. On a dialed funnel that is
  // a lead nobody can call, so it must surface as a failure, not a success.
  if (r.ok && !r.phoneSaved) {
    return { destination: "ghl", ok: false, id: r.contactId, reason: "phone-not-saved" };
  }
  return { destination: "ghl", ok: r.ok, id: r.contactId, reason: r.reason };
}

/* ---------------------------------------------------------------------------
 * Second step answers.
 *
 * Funnels that ask anything AFTER the opt-in (an age check, a qualifier, a
 * "what is stopping you" box) have to get those answers onto the contact the
 * sales floor actually calls from, or the answer may as well not exist. The
 * lead is already banked by the time any of this runs, so nothing here may
 * throw: a failure costs a note, never a lead.
 * ------------------------------------------------------------------------ */

export type GhlContactUpdate = {
  /** Added to whatever the contact already has, never a replacing write. */
  tags?: string[];
  /** Free text, lands in the contact's notes timeline. */
  note?: string;
  /** Do Not Disturb. The only reliable way to stop a dial that is already
   *  queued, e.g. when the visitor turns out to be under 18. */
  dnd?: boolean;
};

/**
 * Resolves the contact for a lead we have already delivered. `upsert` matches
 * on email and phone, so this returns the SAME contact rather than making a
 * second one, which is why the caller can hand us the original lead again
 * instead of having to remember a contact id.
 */
export async function findOrCreateGhlContact(lead: GhlLead): Promise<string | null> {
  if (!process.env.GHL_API_KEY || !process.env.GHL_LOCATION_ID) return null;
  try {
    const { id } = await upsert(lead);
    return id ?? null;
  } catch (e) {
    console.error("[ghl] resolve contact failed:", e instanceof Error ? e.message : e);
    return null;
  }
}

async function addTags(contactId: string, tags: string[]) {
  // The dedicated tags endpoint ADDS. Sending tags on the contact PUT would
  // replace the whole list and silently drop everything the funnel already set.
  const res = await fetch(`${BASE}/contacts/${contactId}/tags`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ tags }),
    signal: AbortSignal.timeout(TIMEOUT),
  });
  if (!res.ok) throw new Error(`tags ${res.status}: ${(await res.text()).slice(0, 160)}`);
}

async function setDnd(contactId: string) {
  const res = await fetch(`${BASE}/contacts/${contactId}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({ dnd: true }),
    signal: AbortSignal.timeout(TIMEOUT),
  });
  if (!res.ok) throw new Error(`dnd ${res.status}: ${(await res.text()).slice(0, 160)}`);
}

async function addNote(contactId: string, body: string) {
  // Some locations reject a note with no author. GHL_NOTE_USER_ID is that
  // author when the location needs one; unset, we try without and accept the
  // 4xx rather than inventing an id.
  const payload: Record<string, unknown> = { body };
  if (process.env.GHL_NOTE_USER_ID) payload.userId = process.env.GHL_NOTE_USER_ID;
  const res = await fetch(`${BASE}/contacts/${contactId}/notes`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(TIMEOUT),
  });
  if (!res.ok) throw new Error(`note ${res.status}: ${(await res.text()).slice(0, 160)}`);
}

/**
 * Applies an update to an existing contact. Each part is independent on
 * purpose: a rejected note must not cost us the DND flag that stops a call to
 * a minor, so every piece reports its own failure and the rest still run.
 */
export async function updateGhlContact(
  contactId: string,
  u: GhlContactUpdate,
): Promise<{ ok: boolean; reason?: string }> {
  if (!process.env.GHL_API_KEY || !process.env.GHL_LOCATION_ID) {
    return { ok: false, reason: "not-configured" };
  }
  const failures: string[] = [];

  // DND first. It is the one part of this with a deadline attached.
  if (u.dnd) {
    try {
      await setDnd(contactId);
    } catch (e) {
      failures.push(e instanceof Error ? e.message : String(e));
    }
  }
  if (u.tags?.length) {
    try {
      await addTags(contactId, u.tags);
    } catch (e) {
      failures.push(e instanceof Error ? e.message : String(e));
    }
  }
  if (u.note) {
    try {
      await addNote(contactId, u.note);
    } catch (e) {
      failures.push(e instanceof Error ? e.message : String(e));
    }
  }

  if (failures.length) {
    console.error("[ghl] contact update partly failed:", failures.join(" | "));
    return { ok: false, reason: failures.join(" | ").slice(0, 200) };
  }
  return { ok: true };
}
