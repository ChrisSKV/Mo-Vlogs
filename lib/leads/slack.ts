// Post the lead into a Slack channel. Some of Ramin's end clients have no CRM
// at all on day one and just want the lead in a channel so someone calls it.
//
// This is a real destination, not the alerting in lib/alert.ts. Keep the two
// webhooks separate (LEAD_SLACK_WEBHOOK vs SLACK_ALERT_WEBHOOK) so leads do not
// drown the channel we watch for failures.

import type { Lead, DeliveryResult } from "./types";

export async function deliverToSlack(lead: Lead): Promise<DeliveryResult> {
  const url = process.env.LEAD_SLACK_WEBHOOK;
  if (!url) return { destination: "slack", ok: false, reason: "not-configured" };

  const lines = [
    `*New lead* ${lead.source ? `(${lead.source})` : ""}`.trim(),
    `Name: ${lead.firstName} ${lead.lastName}`.trim(),
    `Email: ${lead.email}`,
    // Slack linkifies tel: so the number is tappable on mobile, which is the
    // whole point when a human is supposed to ring it.
    `Phone: <tel:${lead.phone}|${lead.phone}>`,
  ];

  // The whole point of the channel is that someone acts on the message. Without
  // a way back to the record they have to go and find this person by hand
  // before they can log the call or read what they answered, which is the
  // friction the notification was supposed to remove.
  for (const l of lead.crmLinks ?? []) lines.push(`<${l.url}|${l.label}>`);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: lines.join("\n") }),
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) {
      return { destination: "slack", ok: false, reason: `post ${res.status}` };
    }
    return { destination: "slack", ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[slack-lead] deliver failed:", msg);
    return { destination: "slack", ok: false, reason: msg.slice(0, 140) };
  }
}
