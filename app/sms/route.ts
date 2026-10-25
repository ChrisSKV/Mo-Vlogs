/* =============================================================================
   GET /sms   <- the page the SMS campaign is filed against.

   WHY THIS PAGE EXISTS, AND WHY IT IS NOT THE FUNNEL. The campaign cannot be
   filed against movlogs.ai: that page leads with a $10,000 investment prize,
   and carriers class a money offer as get-rich-quick, which is a forbidden
   category (30897). Another brand was rejected twice filing its funnel and
   approved the moment it filed a plain company page instead. Rewording the
   campaign description did nothing, three times.

   A bare consent form is rejected the same way, "only a form without adequate
   business context", so this page has to read as a real company AND carry the
   form, in this order: who we are, what we offer, what we do not promise, the
   business identity as filed, the text message programme, then the form.

   ZERO MONEY CLAIMS ON THIS PAGE. Not the prize, not a figure, not a result
   somebody got. That rule is the whole reason it exists.

   NO JAVASCRIPT AND NO FRAMEWORK CHROME. A reviewer fetches the page and reads
   what comes back, so both checkboxes, both labels, the whole disclosure and
   the STOP and HELP wording are in the served HTML, and the boxes start
   unticked because nothing here ever ticks one.

   The wording comes from lib/sms-consent.json, which is also what the API
   route stores as the proof text, so what is shown, what is recorded and what
   is filed cannot drift apart. RUNBOOK 10c.
   ============================================================================= */
import COPY from "@/lib/sms-consent.json";
import { BIZ, bizComplete } from "@/lib/sms-biz";

/* The result banner is read from the query string the API redirects back with,
   so the page must not be cached. */
export const dynamic = "force-dynamic";

const WHO = [
  `${BIZ.brand} is an online education brand, operated by ${BIZ.legal}. We teach complete beginners how to build software with AI tools that need no coding: apps, websites and simple business tools, described in plain language rather than written in code. We publish free training, and we run the Build Challenge, a free skill contest in which entrants build something with those tools and the entries are judged against criteria published in advance.`,
  "We are an education brand and nothing else. We are not a recruiter, a staffing agency, an employer, a lender or an investment company. We do not sell a business opportunity, we do not sell leads, and we do not collect anyone's data on behalf of a third party.",
];

const OFFER: [string, string][] = [
  [
    "Free training on building with AI tools.",
    "Lessons that take someone with no technical background from nothing to a working app.",
  ],
  [
    "The Build Challenge.",
    "A free skill contest. Entry is free, there is nothing to buy to enter, and entries are judged against criteria published in advance.",
  ],
  [
    "Help while you build.",
    "Written guides and walkthroughs for the tools we teach.",
  ],
  [
    "Announcements about what we run next.",
    "New training, new sessions and new contests.",
  ],
];

function esc(t: string): string {
  return t
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** "Service texts (optional)." in bold, then the rest of the sentence. */
function bold(t: string): string {
  return esc(t).replace(/^([^.]+\(optional\)\.)/, "<strong>$1</strong>");
}

const RESULTS: Record<string, string> = {
  ok: "Thank you. Your consent has been recorded for the boxes you ticked.",
  none: "Nothing was recorded: no box was ticked. Tick at least one box to receive text messages.",
  invalid: "Please check the email address and mobile number and try again.",
  error: "Something went wrong on our side. Please try again.",
};

export function GET(req: Request) {
  const result = RESULTS[new URL(req.url).searchParams.get("sms") || ""] || "";

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${esc(BIZ.brand)} | About us and our text messages</title>
<meta name="description" content="${esc(BIZ.brand)}, a brand of ${esc(BIZ.legal)}, teaches beginners to build software with AI tools. Who we are, what we offer, and how to start or stop our text messages."/>
<link rel="icon" href="/icon.png"/>
<style>
:root{color-scheme:light}
*{box-sizing:border-box}
body{margin:0;background:#fbfaf8;color:#2d2b28;font:16px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif}
.wrap{max-width:740px;margin:0 auto;padding:40px 20px 64px}
h1{font-size:28px;line-height:1.25;margin:0 0 8px}
h2{font-size:20px;line-height:1.3;margin:34px 0 8px}
h3{font-size:16px;margin:20px 0 4px}
p,li{font-size:15.5px}
ul{padding-left:20px}
li{margin-bottom:8px}
a{color:#9a6b1f}
.lede{opacity:.85;margin-top:0}
.card{background:#fff;border:1px solid rgba(0,0,0,.1);border-radius:12px;padding:20px;margin-top:20px}
.identity{background:#fff;border:1px solid rgba(0,0,0,.1);border-radius:12px;padding:18px 20px;margin-top:12px}
.identity p{margin:4px 0;font-size:15px}
.todo{background:#fff3cd;border:1px solid #d8b23a;border-radius:10px;padding:14px 16px;margin:16px 0;font-size:14.5px}
.msg{padding:12px 14px;border-radius:8px;background:#f1ece2;font-weight:600;margin:0 0 16px}
form{display:flex;flex-direction:column;gap:12px}
label.f{font-weight:700;font-size:15px;margin-bottom:-6px}
input[type=email],input[type=tel]{width:100%;padding:12px 14px;border-radius:8px;border:1px solid rgba(0,0,0,.2);background:#fff;color:#2d2b28;font-size:16px}
.box{display:flex;gap:10px;align-items:flex-start;font-size:14.5px;line-height:1.5;cursor:pointer}
.box input{margin-top:3px;width:18px;height:18px;flex:0 0 18px;accent-color:#9a6b1f}
.disc{font-size:13.5px;line-height:1.55;opacity:.9;margin:0}
button{margin-top:4px;padding:13px 18px;border:0;border-radius:8px;background:#2d2b28;color:#fff;font-weight:800;font-size:16px;cursor:pointer}
footer{margin-top:40px;font-size:13.5px;opacity:.8}
</style>
</head>
<body>
<div class="wrap">

<h1>${esc(BIZ.brand)}</h1>
<p class="lede">An online education brand teaching people to build software with AI tools. Operated by ${esc(BIZ.legal)}, ${esc(BIZ.country)}.</p>

${
  bizComplete()
    ? ""
    : `<div class="todo"><strong>Not ready to file.</strong> The business identity below still contains placeholders. Fill lib/sms-biz.ts with the details exactly as submitted to the carrier before this URL is given to anyone.</div>`
}

<h2>Who we are</h2>
${WHO.map((p) => `<p>${esc(p)}</p>`).join("\n")}

<h2>What we offer</h2>
<ul>
${OFFER.map(([t, d]) => `<li><strong>${esc(t)}</strong> ${esc(d)}</li>`).join("\n")}
</ul>

<h2>What we do not promise</h2>
<p>We teach. We do not guarantee income, earnings, employment or any particular result, and nothing we publish should be read as a promise of one. What someone gets out of it depends on their background, their effort and their circumstances. Any results shared by people who learned with us are their own and are not typical. We are not financial, legal or tax advisors.</p>

<h2>Business identity</h2>
<div class="identity">
<p><strong>Brand:</strong> ${esc(BIZ.brand)}</p>
<p><strong>Legal entity:</strong> ${esc(BIZ.legal)}</p>
<p><strong>Entity type:</strong> ${esc(BIZ.entityType)}</p>
<p><strong>Licensing authority:</strong> ${esc(BIZ.authority)}</p>
<p><strong>Business registration number:</strong> ${esc(BIZ.registration)}</p>
<p><strong>Tax registration number:</strong> ${esc(BIZ.trn)}</p>
<p><strong>Registered address:</strong> ${esc(BIZ.address)}</p>
<p><strong>Website:</strong> <a href="https://${BIZ.website}">${BIZ.website}</a></p>
<p><strong>Support:</strong> <a href="mailto:${BIZ.support}">${BIZ.support}</a></p>
<p><strong>Policies:</strong> <a href="/privacy">Privacy Policy</a>, <a href="/legal/sms-terms">SMS Terms</a></p>
</div>

<h2>Our text messages</h2>
<p>We send text messages only to people who ask for them on this page, and we ask for each kind of message separately.</p>

<h3>Service messages</h3>
<p>Confirmation that we received your entry to the Build Challenge, updates about your entry, reminders before a deadline, and replies to something you asked us.</p>

<h3>Promotional messages</h3>
<p>Invitations to training we are running, announcements, and information about what we offer.</p>

<h3>How you opt in</h3>
<p>Enter your email address and your mobile number in the form below, tick the box for each kind of message you want, and submit. Both boxes start unticked and we never tick one for you. Ticking one box does not opt you into the other. Consent is optional: it is not required to enter the Build Challenge and it is not a condition of any purchase.</p>

<div class="card">
${result ? `<p class="msg">${esc(result)}</p>` : ""}
<form id="sms-form" method="post" action="/api/sms-consent">
<input type="hidden" name="page" value="/sms"/>
<label class="f" for="sms-email">Email</label>
<input id="sms-email" name="email" type="email" autocomplete="email" required/>
<label class="f" for="sms-phone">Phone number</label>
<input id="sms-phone" name="phone" type="tel" autocomplete="tel" required/>
<label class="box"><input type="checkbox" name="service" value="1"/><span>${bold(COPY.service)}</span></label>
<label class="box"><input type="checkbox" name="promo" value="1"/><span>${bold(COPY.promo)}</span></label>
<p class="disc">${esc(COPY.disclosure)} See our <a href="/privacy">Privacy Policy</a> and our <a href="/legal/sms-terms">SMS Terms</a>.</p>
<button type="submit">Sign me up for texts</button>
</form>
</div>

<h3>Frequency and cost</h3>
<p>Message frequency varies. Message and data rates may apply.</p>

<h3>Stopping messages, and getting help</h3>
<p>Reply <strong>STOP</strong> to any message from us to stop receiving texts. You will get one message confirming that you have been unsubscribed, and nothing after it. Reply <strong>HELP</strong> for help, or email <a href="mailto:${BIZ.support}">${BIZ.support}</a>.</p>

<h3>Your number</h3>
<p>We do not sell, rent or share your mobile number or your SMS consent with third parties or affiliates for their own marketing or promotional purposes. Mobile carriers are not liable for delayed or undelivered messages.</p>

<footer>
<p>${esc(BIZ.legal)}, ${esc(BIZ.address)} &middot; <a href="mailto:${BIZ.support}">${BIZ.support}</a> &middot; <a href="/privacy">Privacy Policy</a> &middot; <a href="/legal/sms-terms">SMS Terms</a></p>
</footer>

</div>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}
