import { NextResponse } from "next/server";
import { parsePhoneNumberFromString, isValidPhoneNumber } from "libphonenumber-js";
import { deliverLead } from "@/lib/leads";
import { isValidEmail, isValidName } from "@/lib/leads/validate";
import { alertSlack } from "@/lib/alert";
import { noteOnLead } from "@/lib/leads/close";

/**
 * Lead capture for the Build Challenge.
 *
 * REPLACES THE ROUTE THAT SHIPPED WITH THE FRONT END. That one banked the row
 * in Neon and then posted it to a CRM_WEBHOOK_URL that was never set, so a
 * lead existed as a log line and nothing else. The database is gone with it:
 * the page that is live reads no counter, and a row nobody queries is not a
 * destination, it is a second place for a lead to be lost.
 *
 * The rule the shape still follows: ANSWER THE VISITOR FIRST. A video drop
 * puts thousands of people on this form inside an hour, and every failure
 * downstream has to end in a 200. A lead that reached Close slowly beats a
 * visitor who bounced on an error page.
 *
 * The one exception is 422, which the form's own client watches for and turns
 * into "please check your details". Only validation returns it.
 *
 * ENV:
 *   LEAD_DESTINATIONS=close
 *   CLOSE_API_KEY, CLOSE_STATUS_ID
 *   DEFAULT_PHONE_COUNTRY=AE
 *   SLACK_ALERT_WEBHOOK (+ SLACK_ALERT_USER_ID) so a failure pages us
 */

/* Close is given room to answer (see the timeouts in lib/leads/close.ts).
   Without this the platform default can kill the function mid-write: the lead
   is lost with no log and no alert, which is worse than any slow CRM. */
export const maxDuration = 30;

const FUNNEL = process.env.FUNNEL_NAME || "Mo Vlogs Build Challenge";

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

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
  const rawPhone = str(body.phone).slice(0, 32);
  const source = str(body.source).slice(0, 300) || "direct";

  /* 422 is the only status the visitor ever sees, because it is the only one
     their own input can fix. */
  if (!id || !isValidName(firstName) || !isValidEmail(email)) {
    return NextResponse.json(
      { ok: false, error: "Please check your details and try again." },
      { status: 422 },
    );
  }

  /* The phone is the product on a dialed funnel. The form already emits E.164,
     but it is parsed again here because the client can be bypassed, and a
     number the dialer cannot ring is a lead nobody calls. */
  const parsed = parsePhoneNumberFromString(
    rawPhone,
    (process.env.DEFAULT_PHONE_COUNTRY || "AE") as never,
  );
  if (!parsed || !parsed.isValid() || !isValidPhoneNumber(parsed.number)) {
    return NextResponse.json(
      { ok: false, error: "Please check your details and try again." },
      { status: 422 },
    );
  }

  const results = await deliverLead({
    firstName,
    /* The form collects one name. Close shows the lead by name in the calling
       views, so an empty surname reads as a broken record rather than as a
       person who gave one name. */
    lastName: "",
    email,
    phone: parsed.number,
    countryCode: parsed.country,
    source,
    attribution: { funnelLeadId: id },
  });

  const who = `${firstName} · ${email} · ${parsed.number}`;
  const failures = results.filter((r) => !r.ok && r.reason !== "not-configured");
  const delivered = results.some((r) => r.ok);

  if (failures.length) {
    /* This log line IS the recovery path when every destination is down. */
    console.error(
      `[lead] delivery failures on ${FUNNEL}:`,
      JSON.stringify({ id, who, source, failures }),
    );
    const detail = failures.map((f) => `${f.destination} (${f.reason})`).join(", ");
    await alertSlack(
      delivered
        ? `⚠️ ${FUNNEL}: lead did NOT reach ${detail}. It DID reach another destination, so nothing is lost:\n*${who}*`
        : `🚨 ${FUNNEL}: lead reached NOTHING (${detail}). Recover this lead by hand:\n*${who}*\nsource: ${source}`,
    );
  }

  return NextResponse.json({ ok: true, id, delivered });
}

/**
 * The thank-you page's follow-up answers.
 *
 * They go on the lead in Close as a note, which is where the person who rings
 * will actually read them. Nothing here may block or error at the visitor: a
 * failed PATCH costs a sort key, never a lead.
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

  /* The lead is found by email. The client-side id identifies the submission,
     not the person, and Close has no field holding it. */
  const email = str(body.email).slice(0, 200);
  if (!isValidEmail(email)) return NextResponse.json({ ok: true });

  const lines: string[] = [];
  const add = (label: string, v: unknown) => {
    const t = str(v);
    if (t) lines.push(`${label}: ${t.slice(0, 2000)}`);
  };
  if (typeof body.ageConfirmed === "boolean") {
    lines.push(`18 or over: ${body.ageConfirmed ? "yes" : "NO"}`);
  }
  add("What they want to build", body.ideaText);
  add("Building it for", body.buildFor);
  add("Time available", body.timeAvailable);
  add("Best time to call", body.bestTime);

  if (!lines.length) return NextResponse.json({ ok: true });

  try {
    await noteOnLead(email, ["From the thank-you page", ...lines].join("\n"));
  } catch (e) {
    console.error("[lead] PATCH note failed:", e instanceof Error ? e.message : e, { email });
  }

  return NextResponse.json({ ok: true });
}
