// Generic webhook destination: Make, Zapier, n8n, a client's own endpoint.
//
// Use it when the client's system is not one we have a real adapter for. Prefer
// a real adapter whenever one exists: a webhook gives us no confirmation that
// the record was actually created, only that something accepted the POST.

import type { Lead, DeliveryResult } from "./types";

export async function deliverToWebhook(lead: Lead): Promise<DeliveryResult> {
  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) return { destination: "webhook", ok: false, reason: "not-configured" };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Optional shared secret so the receiving end can reject anything that
        // is not us. Plenty of client endpoints are otherwise wide open.
        ...(process.env.LEAD_WEBHOOK_SECRET
          ? { "X-Webhook-Secret": process.env.LEAD_WEBHOOK_SECRET }
          : {}),
      },
      body: JSON.stringify({
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        countryCode: lead.countryCode,
        source: lead.source,
        smsConsent: lead.smsConsent,
        smsMarketingConsent: lead.smsMarketingConsent,
        attribution: lead.attribution ?? {},
        receivedAt: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      return {
        destination: "webhook",
        ok: false,
        reason: `post ${res.status}: ${(await res.text()).slice(0, 120)}`,
      };
    }
    return { destination: "webhook", ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[webhook] deliver failed:", msg);
    return { destination: "webhook", ok: false, reason: msg.slice(0, 140) };
  }
}
