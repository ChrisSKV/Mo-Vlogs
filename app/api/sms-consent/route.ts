import { after } from "next/server";
import { neon } from "@neondatabase/serverless";
import COPY from "@/lib/sms-consent.json";

/* =============================================================================
   POST /api/sms-consent   <- the consent form on /sms

   The filing says each kind of message goes only to numbers that ticked the
   box for it, and that is only true if the proof exists and the sales team can
   see it. So every consent is written twice: a row in `sms_consents` with the
   exact wording, the IP and the time, and a note on the person's lead in Close,
   where whoever picks up the phone will actually look.

   A PLAIN FORM POST, NO JAVASCRIPT. A reviewer fetches /sms and reads the HTML,
   so the form has to work without a client bundle. The response is a 303 back
   to the page with a result in the query string.

   NOTHING HERE BLOCKS THE VISITOR. Both writes run after the redirect, and a
   failure is logged whole so a lost consent can be recovered by hand.

   NO BOX TICKED IS NOT CONSENT. Nothing is recorded and nothing is written to
   Close, because a row saying "asked and declined" would be read as consent by
   the next person who opens it.
   ============================================================================= */

export const dynamic = "force-dynamic";

const CLOSE = "https://api.close.com/api/v1";

/** Only a path on this site, so the redirect back can never be an open redirect. */
function backTo(raw: string): string {
  return raw.startsWith("/") && !raw.startsWith("//") ? raw.split("?")[0] : "/sms";
}

function seeOther(path: string, result: string): Response {
  return new Response(null, {
    status: 303,
    headers: { Location: `${path}?sms=${result}#sms-form` },
  });
}

/**
 * The campaign covers US, Canada and UK numbers. A bare ten digit number is
 * North American, so it gets +1; anything else must arrive in E.164 or it is
 * refused rather than guessed. A consent recorded against the wrong number
 * protects nobody.
 */
function e164(raw: string): string {
  const t = raw.trim();
  const d = t.replace(/\D/g, "");
  if (t.startsWith("+") && d.length >= 10 && d.length <= 15) return `+${d}`;
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith("1")) return `+${d}`;
  return "";
}

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for") || "";
  return (fwd.split(",")[0] || req.headers.get("x-real-ip") || "").trim().slice(0, 64);
}

function closeHeaders() {
  const auth = Buffer.from(`${process.env.CLOSE_API_KEY}:`).toString("base64");
  return {
    Authorization: `Basic ${auth}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

/** Put the consent where a setter will see it, on the lead in Close. */
async function noteInClose(record: {
  email: string;
  phone: string;
  service: boolean;
  promo: boolean;
  text: string;
  ip: string;
}) {
  const res = await fetch(
    `${CLOSE}/lead/?query=${encodeURIComponent(record.email)}&_limit=1`,
    { headers: closeHeaders(), signal: AbortSignal.timeout(6000) },
  );
  if (!res.ok) throw new Error(`lead search ${res.status}`);
  const j = (await res.json()) as { data?: { id?: string }[] };
  const leadId = j.data?.[0]?.id;

  const body = [
    `SMS consent captured on movlogs.ai/sms`,
    `Service texts: ${record.service ? "YES" : "no"}`,
    `Promotional texts: ${record.promo ? "YES" : "no"}`,
    `Number: ${record.phone}`,
    `Email: ${record.email}`,
    `IP: ${record.ip}`,
    `Wording shown (version ${COPY.version}): ${record.text}`,
  ].join("\n");

  if (!leadId) {
    // No lead yet: the person reached /sms before opting in on the funnel.
    // Create one so the consent is not floating with nothing attached.
    const created = await fetch(`${CLOSE}/lead/`, {
      method: "POST",
      headers: closeHeaders(),
      body: JSON.stringify({
        name: record.email,
        ...(process.env.CLOSE_STATUS_ID ? { status_id: process.env.CLOSE_STATUS_ID } : {}),
        contacts: [
          {
            name: record.email,
            emails: [{ email: record.email, type: "office" }],
            phones: [{ phone: record.phone, type: "mobile" }],
          },
        ],
        description: body,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!created.ok) throw new Error(`lead create ${created.status}`);
    return;
  }

  const note = await fetch(`${CLOSE}/activity/note/`, {
    method: "POST",
    headers: closeHeaders(),
    body: JSON.stringify({ lead_id: leadId, note: body }),
    signal: AbortSignal.timeout(10000),
  });
  if (!note.ok) throw new Error(`note ${note.status}`);
}

export async function POST(req: Request) {
  let f: FormData;
  try {
    f = await req.formData();
  } catch {
    return seeOther("/sms", "error");
  }

  const page = backTo(String(f.get("page") || "/sms"));
  const email = String(f.get("email") || "").trim().toLowerCase();
  const phone = e164(String(f.get("phone") || ""));
  const service = f.get("service") === "1";
  const promo = f.get("promo") === "1";

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !phone) return seeOther(page, "invalid");
  if (!service && !promo) return seeOther(page, "none");

  const record = {
    email,
    phone,
    service,
    promo,
    page,
    version: COPY.version,
    text: [service ? COPY.service : "", promo ? COPY.promo : "", COPY.disclosure]
      .filter(Boolean)
      .join(" | "),
    ip: clientIp(req),
    userAgent: (req.headers.get("user-agent") || "").slice(0, 300),
  };

  after(async () => {
    const url = process.env.DATABASE_URL || "";
    if (url) {
      try {
        const sql = neon(url);
        await sql`
          CREATE TABLE IF NOT EXISTS sms_consents (
            id BIGSERIAL PRIMARY KEY,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            service BOOLEAN NOT NULL,
            promo BOOLEAN NOT NULL,
            page TEXT NOT NULL,
            version TEXT NOT NULL,
            text TEXT NOT NULL,
            ip TEXT NOT NULL,
            user_agent TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
          )`;
        await sql`
          INSERT INTO sms_consents (email, phone, service, promo, page, version, text, ip, user_agent)
          VALUES (${record.email}, ${record.phone}, ${record.service}, ${record.promo}, ${record.page},
                  ${record.version}, ${record.text}, ${record.ip}, ${record.userAgent})`;
      } catch (e) {
        // The log line IS the recovery path when the database is unreachable.
        console.error("[sms-consent] record failed:", e instanceof Error ? e.message : e, record);
      }
    } else {
      console.warn("[sms-consent] no DATABASE_URL, consent logged only:", JSON.stringify(record));
    }

    if (!process.env.CLOSE_API_KEY) {
      console.warn("[sms-consent] Close not configured, consent not visible to the team:", email);
      return;
    }
    try {
      await noteInClose(record);
    } catch (e) {
      console.error("[sms-consent] Close write failed:", e instanceof Error ? e.message : e, {
        email,
      });
    }
  });

  return seeOther(page, "ok");
}
