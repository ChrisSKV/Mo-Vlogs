import { neon } from "@neondatabase/serverless";

/**
 * Leads are banked here BEFORE any qualification, and the caller treats a
 * failed write as a success (see app/api/lead/route.ts). A lead that reached
 * us slowly beats a visitor who bounced on an error page.
 */
export type LeadRow = {
  id: string;
  firstName: string;
  email: string;
  phone: string;
  country: string | null;
  source: string;
  userAgent: string | null;
};

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

export async function ensureSchema() {
  if (!sql) return;
  await sql`
    CREATE TABLE IF NOT EXISTS leads (
      id           TEXT PRIMARY KEY,
      first_name   TEXT NOT NULL,
      email        TEXT NOT NULL,
      phone        TEXT NOT NULL,
      country      TEXT,
      source       TEXT,
      user_agent   TEXT,
      -- progressive profiling, all filled in from /thanks after the lead exists
      age_confirmed  BOOLEAN,
      idea_text      TEXT,
      build_for      TEXT,
      time_available TEXT,
      best_time      TEXT,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
}

export async function insertLead(lead: LeadRow) {
  if (!sql) return;
  await sql`
    INSERT INTO leads (id, first_name, email, phone, country, source, user_agent)
    VALUES (${lead.id}, ${lead.firstName}, ${lead.email}, ${lead.phone},
            ${lead.country}, ${lead.source}, ${lead.userAgent})
    ON CONFLICT (id) DO NOTHING`;
}

/** Entries so far, for the counter under the form. */
export async function countLeads(): Promise<number> {
  if (!sql) return 0;
  const rows = (await sql`SELECT COUNT(*)::int AS n FROM leads`) as { n: number }[];
  return rows[0]?.n ?? 0;
}

export type LeadPatch = {
  age_confirmed?: boolean;
  idea_text?: string;
  build_for?: string;
  time_available?: string;
  best_time?: string;
};

/**
 * Progressive profiling from the thank-you page. Every field is optional and
 * arrives independently — the visitor answers one chip at a time — so this is
 * a single COALESCE update rather than a column-name interpolation: absent
 * fields pass null and leave the existing value alone. One round trip, fully
 * parameterised, and no dynamic identifier to get wrong.
 *
 * The lead is already banked by the time any of this runs, so a failure here
 * costs a sort key, never a lead.
 */
export async function patchLead(id: string, p: LeadPatch) {
  if (!sql) return;
  await sql`
    UPDATE leads SET
      age_confirmed  = COALESCE(${p.age_confirmed ?? null}::boolean, age_confirmed),
      idea_text      = COALESCE(${p.idea_text ?? null}::text,        idea_text),
      build_for      = COALESCE(${p.build_for ?? null}::text,        build_for),
      time_available = COALESCE(${p.time_available ?? null}::text,   time_available),
      best_time      = COALESCE(${p.best_time ?? null}::text,        best_time),
      updated_at     = now()
    WHERE id = ${id}`;
}
