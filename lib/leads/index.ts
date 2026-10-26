// The dispatcher. One funnel, one env var, any combination of destinations.
//
//   LEAD_DESTINATIONS=close
//   LEAD_DESTINATIONS=ghl,slack
//
// Every destination runs in PARALLEL and independently: one being slow never
// delays another, and one being down never stops another from getting the
// lead. Nothing here throws, because the visitor must reach the thank-you page
// whatever the CRMs are doing.

import type { Lead, DeliveryResult } from "./types";
import { deliverToClose } from "./close";
import { deliverToGhlDestination } from "./ghl";
import { deliverToSlack } from "./slack";
import { deliverToWebhook } from "./webhook";

const ADAPTERS: Record<string, (lead: Lead) => Promise<DeliveryResult>> = {
  close: deliverToClose,
  ghl: deliverToGhlDestination,
  slack: deliverToSlack,
  webhook: deliverToWebhook,
};

/** Which destinations this funnel is configured for. */
export function configuredDestinations(): string[] {
  return (process.env.LEAD_DESTINATIONS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Where a delivered lead can be opened by a human. Slack carries these so the
 * person who sees the notification can reach the record in one tap.
 */
function crmLink(r: DeliveryResult): { label: string; url: string } | null {
  if (!r.ok || !r.id) return null;
  if (r.destination === "ghl" && process.env.GHL_LOCATION_ID) {
    return {
      label: "Open in GoHighLevel",
      url: `https://app.gohighlevel.com/v2/location/${process.env.GHL_LOCATION_ID}/contacts/detail/${r.id}`,
    };
  }
  // Close needs no org in the path: the lead id resolves on its own, and the
  // app sends whoever opens it to the right organisation.
  if (r.destination === "close") {
    return { label: "Open in Close", url: `https://app.close.com/lead/${r.id}/` };
  }
  return null;
}

async function run(name: string, lead: Lead): Promise<DeliveryResult> {
  const adapter = ADAPTERS[name];
  // A typo in the env var would otherwise look exactly like success.
  if (!adapter) return { destination: name, ok: false, reason: "unknown-destination" };
  try {
    return await adapter(lead);
  } catch (e) {
    // Adapters are written not to throw, but one bad deploy must not take down
    // the others or the response.
    const msg = e instanceof Error ? e.message : String(e);
    return { destination: name, ok: false, reason: msg.slice(0, 140) };
  }
}

export async function deliverLead(lead: Lead): Promise<DeliveryResult[]> {
  const names = configuredDestinations();

  // An unset LEAD_DESTINATIONS is a deploy that silently drops every lead, so
  // it must be loud. The route turns this into a Slack alert.
  if (names.length === 0) {
    return [{ destination: "none", ok: false, reason: "no-destinations-configured" }];
  }

  // Slack is a notification about the lead, not a home for it, so it goes last
  // and carries links to the CRMs that just took it. Everything else still runs
  // in parallel: one destination being slow never delays another, and one being
  // down never stops another from getting the lead.
  const crms = names.filter((n) => n !== "slack");
  const results = await Promise.all(crms.map((n) => run(n, lead)));

  if (names.includes("slack")) {
    const crmLinks = results.map(crmLink).filter((l) => l !== null);
    // All of this runs after the visitor already has their response, so the
    // extra round trip costs them nothing.
    results.push(await run("slack", { ...lead, crmLinks }));
  }

  return results;
}

export type { Lead, DeliveryResult };
