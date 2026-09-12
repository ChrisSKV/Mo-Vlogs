# The Build Challenge

Lead-gen funnel for Mo Vlogs × Base44. Name / email / phone opt-in, framed as an
application to a filmed investment competition. The sales floor dials every lead.

Full reasoning, research and section-by-section copy rationale:
[`docs/build-challenge-spec.html`](docs/build-challenge-spec.html).

```bash
npm install && npm run dev
```

## Routes

| Route | What it is |
| --- | --- |
| `/` | The opt-in. Everything above the button is budgeted to a 640px fold. |
| `/thanks` | Age gate, the "what do you want to build" field, and the call block. |
| `/rules` | Competition terms. Drafting framework — needs counsel. |
| `/privacy` | Privacy. Drafting framework — needs counsel. |
| `/api/lead` | `POST` banks the lead, `PATCH` adds the thank-you page answers. |
| `/api/geo` | Vercel geo header, so the phone field defaults to the right country. |

## The one rule

**Nothing goes above the button that is not in the budget** at the top of
[`app/page.tsx`](app/page.tsx). It is measured, not estimated — the first draft
came out at 727px and missed the fold on a 375×812 phone. It now lands at 622px
with 18px of headroom. If you add something up there, take the pixels from
something else and re-measure.

Second rule: **the conditions strip is never truncated.** It is the
significant-conditions disclosure and the reason this is a skill contest rather
than a lottery.

## Before it goes live

Everything the client still owes us is in [`lib/tokens.ts`](lib/tokens.ts) as a
loud `{PLACEHOLDER}`, so nothing ships looking finished when it is not. Missing
images render as labelled slots — drop the file at the path the slot names and
reload.

Launch blockers:

- **The domain.** Not chosen yet. Also decides whether this replaces or sits
  beside `movlogscircle.com`, which currently owns line 1 of every video
  description.
- **`PRIZE_RING_FENCED`** in `lib/tokens.ts`. `false` ships the safe headline
  ("Compete for $50,000"). Flip it to `true` only once the money is genuinely in
  a separate account — it unlocks "Mo invests $50,000" and the "already set
  aside" line.
- **`CRM_WEBHOOK_URL`** and **`DATABASE_URL`**. Without them leads are logged
  server-side only and nothing reaches the floor.
- A photo of Mo, the close/final dates, the judges, and the legal entity.

## Things that bit us, so they do not bite you again

- `crypto.randomUUID()` throws on Android WebView < 92 — a real slice of this
  audience. `newId()` in `components/lead.ts` falls back. Do not simplify it.
- The lead is banked **before** any qualification and the API is fail-open: a
  failed write still returns 200. A lead that arrives slowly beats a visitor who
  bounced on an error page.
- No SMS one-time code on the form, deliberately. The existing Circle funnel
  caps at 150 SMS/hour globally and 8/hour per non-UAE country prefix, and fails
  closed — a video drop trips it within minutes.
- SMS and WhatsApp confirmation are **not** a 48-hour capability (sender-ID
  registration is multi-week in every top market). Day one is email;
  `NEXT_PUBLIC_MESSAGING_CHANNEL` flips the copy without a redeploy.
