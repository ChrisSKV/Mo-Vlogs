"use client";

import { useEffect, useState } from "react";

/**
 * The handoff between the opt-in form and the thank-you page: the form stashes
 * what the visitor typed in sessionStorage right before the redirect, and the
 * thank-you screen reads it back to greet them by name and confirm the phone
 * number without ever printing it in full.
 *
 * Ported from the Kingsplay funnel, plus a leadId so /thanks can PATCH the
 * progressive-profiling answers onto the row the form already banked.
 */

export type Lead = {
  id: string | null;
  firstName: string | null;
  email: string | null;
  last2: string | null;
};

export const LEAD_KEY = "bc_lead";

/* Anything that is not a letter, mark, space, apostrophe or hyphen is
   stripped. \p{L} keeps Arabic and Indic scripts intact — a meaningful share
   of this audience types their name in one. The hyphen is allowed INSIDE a
   name on purpose: Anne-Marie is her name, not our copy. */
const NAME_STRIP = /[^\p{L}\p{M}\s'’-]/gu;

export function cleanFirstName(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v
    .normalize("NFC")
    .replace(NAME_STRIP, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 14)
    .trim();
  if (s.length < 2) return null;
  return s[0].toLocaleUpperCase() + s.slice(1);
}

export function cleanEmail(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) ? s : null;
}

/** Last two digits, so the page can confirm the number without printing it. */
export function last2(e164: unknown): string | null {
  if (typeof e164 !== "string") return null;
  const d = e164.replace(/\D/g, "");
  return d.length >= 6 ? d.slice(-2) : null;
}

/** Maps a known provider to its inbox, so "open your inbox" actually lands. */
export function inboxUrl(email: string | null): string | null {
  if (!email) return null;
  const domain = (email.split("@")[1]?.toLowerCase() ?? "") + ".";
  if (/^(gmail|googlemail)\./.test(domain)) return "https://mail.google.com";
  if (/^(outlook|hotmail|live|msn)\./.test(domain)) return "https://outlook.live.com/mail";
  if (/^yahoo\./.test(domain)) return "https://mail.yahoo.com";
  if (/^(icloud|me|mac)\./.test(domain)) return "https://www.icloud.com/mail";
  if (/^(proton|protonmail|pm)\./.test(domain)) return "https://mail.proton.me";
  if (/^aol\./.test(domain)) return "https://mail.aol.com";
  if (/^(rediffmail|rediff)\./.test(domain)) return "https://mail.rediff.com";
  return null; // unknown provider: the button simply does not render
}

/**
 * crypto.randomUUID() is unavailable in insecure contexts and on Android
 * WebView < 92 / iOS < 15.4 — old Androids across South Asia and MENA are
 * precisely this audience, and this sits in the critical path of the only
 * form on the site. Without the fallback those visitors get a silent total
 * form failure.
 */
export function newId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through */
  }
  try {
    const b = new Uint8Array(16);
    crypto.getRandomValues(b);
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
  } catch {
    // Last resort. Collision risk is irrelevant next to losing the lead.
    return `f-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
  }
}

/** Traffic source for the CRM: campaign UTMs, then click ids, then referrer. */
export function trafficSource(): string {
  try {
    const q = new URLSearchParams(window.location.search);
    const utm = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]
      .map((k) => (q.get(k) ? `${k.replace("utm_", "")}=${q.get(k)}` : ""))
      .filter(Boolean)
      .join(" | ");
    if (utm) return utm;
    for (const k of ["fbclid", "gclid", "ttclid", "igshid"]) {
      if (q.get(k)) return `${k}=${q.get(k)}`;
    }
    const ref = document.referrer;
    if (ref && !ref.includes(window.location.host)) return `referrer=${new URL(ref).hostname}`;
    return "direct";
  } catch {
    return "direct";
  }
}

/** Called by the form right before the redirect. Failure is fine: private
    mode just means a nameless greeting on the next page. */
export function stashLead(d: { id: string; firstName: string; email: string; phone: string }) {
  try {
    sessionStorage.setItem(LEAD_KEY, JSON.stringify(d));
  } catch {
    // no storage, no greeting, no error
  }
}

/**
 * Reads the lead stashed by the form. Runs after mount only, so the server
 * renders the nameless copy and nothing depends on storage existing. Private
 * mode, a cleared session or malformed JSON all degrade to no data.
 */
export function useLead(): Lead {
  const [lead, setLead] = useState<Lead>({ id: null, firstName: null, email: null, last2: null });

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(LEAD_KEY);
      if (!raw) return;
      const d = JSON.parse(raw) as Record<string, unknown>;
      setLead({
        id: typeof d.id === "string" ? d.id : null,
        firstName: cleanFirstName(d.firstName),
        email: cleanEmail(d.email),
        last2: last2(d.phone),
      });
    } catch {
      // no stash, no greeting, no error
    }
  }, []);

  return lead;
}
