/* =============================================================================
   GET /legal/sms-terms

   The terms page filed with the SMS campaign, deliberately separate from every
   other page on the funnel. Twilio's checker reported "no readable content"
   against another brand's terms page that answered 200 perfectly well, because
   it was 69KB of mirrored marketing markup and whatever fetches it on the
   carrier's side could not get the text out. Arguing with a reviewer's crawler
   is not a plan, so this is a few kilobytes of plain HTML with no scripts, no
   fonts and no login. RUNBOOK 10c.

   The words come from lib/sms-terms.json, the same file /sms is built from, so
   what a reviewer reads in two places cannot disagree.
   ============================================================================= */
import TERMS from "@/lib/sms-terms.json";
import { BIZ } from "@/lib/sms-biz";

export const dynamic = "force-static";

function esc(t: string): string {
  return t
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function GET() {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>SMS Terms and Conditions | ${esc(BIZ.brand)}</title>
<meta name="description" content="Text messaging terms and conditions for ${esc(BIZ.legal)} and its ${esc(BIZ.brand)} brand."/>
<link rel="icon" href="/icon.png"/>
<style>
:root{color-scheme:light}
*{box-sizing:border-box}
body{margin:0;background:#fbfaf8;color:#2d2b28;font:16px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif}
.wrap{max-width:720px;margin:0 auto;padding:40px 20px 64px}
h1{font-size:27px;line-height:1.25;margin:0 0 6px}
h3{font-size:19px;line-height:1.3;margin:30px 0 8px}
p{font-size:15.5px}
a{color:#9a6b1f}
.lede{opacity:.85;margin-top:0}
footer{margin-top:40px;font-size:13.5px;opacity:.8}
</style>
</head>
<body>
<div class="wrap">
<h1>SMS Terms and Conditions</h1>
<p class="lede">${esc(BIZ.legal)}, including its ${esc(BIZ.brand)} brand. Last updated ${esc(TERMS.version)}.</p>
${TERMS.html}
<p>You can start or stop text messages on our <a href="/sms">SMS sign-up page</a>. See also our <a href="/privacy">Privacy Policy</a>.</p>
<footer>
<p>${esc(BIZ.legal)}, ${esc(BIZ.address)} &middot; <a href="mailto:${BIZ.support}">${BIZ.support}</a></p>
</footer>
</div>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
