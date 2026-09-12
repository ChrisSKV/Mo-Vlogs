import { NextResponse } from "next/server";
import { ensureSchema, insertLead, patchLead, type LeadPatch } from "@/lib/db";

/**
 * Lead capture for the Build Challenge.
 *
 * The rule this route is built around: BANK THE LEAD, THEN DO EVERYTHING ELSE.
 * A video drop puts thousands of people on this form inside an hour, and every
 * failure mode downstream — Neon unreachable, CRM timing out, a malformed
 * field — must still return 200. A lead that reached the CRM slowly beats a
 * visitor who bounced on an error page, and an error page is what the existing
 * movlogscircle.com funnel serves once its SMS caps trip.
 *
 * ENV TO SET BEFORE LAUNCH:
 *  - DATABASE_URL      → Neon. Without it, leads are logged server-side only.
 *  - CRM_WEBHOOK_URL   → the inbound webhook that triggers the sales dial.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Public endpoint: JSON.parse accepts null/arrays/numbers and non-string
// fields, so every access is type-guarded to keep crafted bodies at 400/422
// instead of crashing to a 500.
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

let schemaReady: Promise<void> | null = null;
function schema() {
  if (!schemaReady) schemaReady = ensureSchema().catch(() => {});
  return schemaReady;
}

export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 });
  }
  const body = (raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {}) as Record<
    string,
    unknown
  >;

  const id = str(body.id).slice(0, 64);
  const firstName = str(body.firstName).slice(0, 80);
  const email = str(body.email).slice(0, 200);
  const phone = str(body.phone).slice(0, 32);

  // Validation is deliberately thin. The phone field already refuses to emit
  // anything but E.164, and anything stricter here only loses real people.
  if (!id || firstName.length < 2 || !EMAIL_RE.test(email) || !phone.startsWith("+")) {
    return NextResponse.json(
      { ok: false, error: "Please check your details and try again." },
      { status: 422 },
    );
  }

  const lead = {
    id,
    firstName,
    email,
    phone,
    country: request_country(req),
    source: str(body.source).slice(0, 300) || "direct",
    userAgent: (req.headers.get("user-agent") || "").slice(0, 400) || null,
  };

  // Neon first, because the row is what the sales floor works from. Failure is
  // swallowed on purpose — see the note at the top of this file.
  try {
    await schema();
    await insertLead(lead);
  } catch (err) {
    console.error("[lead] db write failed, continuing", err);
  }

  const webhook = process.env.CRM_WEBHOOK_URL;
  if (webhook) {
    // The redirect must never hang on the CRM: give it 5s, then move on.
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...lead, funnel: "build-challenge" }),
        signal: AbortSignal.timeout(5000),
      });
    } catch (err) {
      console.error("[lead] CRM webhook failed", err);
    }
  } else {
    console.log("[lead] captured (no CRM webhook configured)", lead.id);
  }

  return NextResponse.json({ ok: true, id });
}

/**
 * Progressive profiling from the thank-you page. The lead already exists, so
 * nothing here may block the visitor or surface an error to them — a failed
 * PATCH costs us a sort key, not a lead.
 */
export async function PATCH(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }
  const body = (raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {}) as Record<
    string,
    unknown
  >;
  const id = str(body.id).slice(0, 64);
  if (!id) return NextResponse.json({ ok: true });

  const patch: LeadPatch = {};
  if (typeof body.ageConfirmed === "boolean") patch.age_confirmed = body.ageConfirmed;
  if (str(body.ideaText)) patch.idea_text = str(body.ideaText).slice(0, 2000);
  if (str(body.buildFor)) patch.build_for = str(body.buildFor).slice(0, 120);
  if (str(body.timeAvailable)) patch.time_available = str(body.timeAvailable).slice(0, 120);
  if (str(body.bestTime)) patch.best_time = str(body.bestTime).slice(0, 200);

  try {
    await schema();
    await patchLead(id, patch);
  } catch (err) {
    console.error("[lead] patch failed", err);
  }

  return NextResponse.json({ ok: true });
}

function request_country(req: Request): string | null {
  const c = req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry");
  return c && c !== "XX" ? c.toUpperCase() : null;
}
