// Ping a Slack channel when a lead fails to deliver, so we hear about it in
// seconds instead of finding it in the logs later. Needs SLACK_ALERT_WEBHOOK
// (a Slack Incoming Webhook URL). No-ops if unset, and never throws: an alert
// failing must not affect the lead response.
export async function alertSlack(text: string): Promise<void> {
  const url = process.env.SLACK_ALERT_WEBHOOK;
  if (!url) return;
  // @mention a user so it pings them, not just posts to the channel
  const mention = process.env.SLACK_ALERT_USER_ID ? `<@${process.env.SLACK_ALERT_USER_ID}> ` : "";
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: mention + text }),
      signal: AbortSignal.timeout(4000),
    });
  } catch (e) {
    console.error("[alert] slack post failed:", e instanceof Error ? e.message : e);
  }
}
