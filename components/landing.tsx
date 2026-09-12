import OptinForm from "@/components/optin-form";
import { HostTag, MoAvatar, VerifiedMark } from "@/components/host-tag";
import { Countdown } from "@/components/countdown";
import { Embers } from "@/components/embers";
import { SecureNote } from "@/components/secure-note";
import { Sparkles } from "@/components/sparkles";
import {
  CLOSE_DATE,
  FINAL_DATE,
  PRIZE,
  PRIZE_EQUITY,
  PRIZE_RING_FENCED,
  SUPPORT_EMAIL,
} from "@/lib/tokens";

/* ---------------------------------------------------------------------------
   PAGE 1 — THE OPT-IN.

   SHORT ON PURPOSE. Hot traffic off Mo's own channel arrives already
   interested, so every extra section is a place to lose them rather than a
   chance to persuade. Two blocks and a footer. The rubric, the judges and
   every condition live on /rules, one click away, where a reader who wants
   detail can go and nobody else has to scroll past it.

   DESKTOP IS A REAL LAYOUT, not the phone column centred in a void: two
   columns from lg up on the house 70rem container, copy left and form right,
   stacking at one breakpoint with the form ahead of the supporting points.

   See docs/build-challenge-spec.html §03 and §07.
   ------------------------------------------------------------------------- */

export function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[70rem] px-5 md:px-8 ${className}`}>
      {children}
    </div>
  );
}

/* -------------------------------- top bar ------------------------------- */

/**
 * The only fixed chrome on the page, and it earns its height by doing one job
 * the hero cannot: carrying the deadline with you as you scroll.
 *
 * There is deliberately no logo or nav up here. A masthead that repeats what
 * the hero already says is spent height on the one screen that has none to
 * give. The whole bar is the tap target, so it doubles as the shortcut back to
 * the form from anywhere on the page.
 */
export function TopBar() {
  return (
    <a
      href="#entry-form"
      className="sticky top-0 z-40 block border-b border-[#f5f2ea]/10 bg-ink-deep text-[#f5f2ea]"
    >
      <Container className="flex h-[46px] items-center justify-center gap-3 md:h-[50px] md:gap-5">
        <p className="truncate text-[12.5px] leading-none md:text-[13.5px]">
          <span className="hidden sm:inline">Season 1 entries close </span>
          <span className="sm:hidden">Closes </span>
          <span className="font-semibold text-gold-top">{CLOSE_DATE}</span>
        </p>
        <Countdown variant="bar" />
      </Container>
    </a>
  );
}

/* --------------------------------- hero --------------------------------- */

const HERO_POINTS = [
  "No coding. You describe it, the AI builds it.",
  "Free training, free to enter, nothing to buy.",
  "Your first working app can be live tonight.",
];

function Hero() {
  return (
    <section>
      <Container className="py-10 md:py-16 lg:py-20">
        <div className="hero-grid">
          {/* ------------------------------------------------------- copy */}
          <div className="hero-copy text-center lg:text-left">
            {/* Free entry is what makes this a skill contest rather than a
                lottery, so it has to appear in the promotional material and
                not only on /rules. Above the fold on every viewport. */}
            <p className="inline-flex items-center gap-x-2 rounded-full bg-red/[0.12] px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-red">
              <span
                className="livedot h-[7px] w-[7px] shrink-0 rounded-full bg-red"
                aria-hidden
              />
              Free to enter
            </p>

            {/* 30px on phones so "Compete for $50,000" holds one line. At 34 it
                broke to a fourth line and pushed the form a screen down. */}
            <h1 className="font-display mt-5 text-[30px] font-bold leading-[1.12] tracking-[-0.035em] text-ink sm:text-[34px] md:text-[46px] md:leading-[1.08]">
              You have the idea.
              <br />
              AI builds it for you.
              <br />
              Compete for <span className="hl">{PRIZE}</span>
            </h1>

            <p className="mx-auto mt-5 max-w-[46ch] text-[16.5px] leading-[1.6] text-slate md:mt-6 md:text-[19px] lg:mx-0">
              Mo is putting {PRIZE} of his own money into one business from this
              group. No coding, and nothing to pay.
            </p>

            <div className="mt-7">
              <p className="mb-2.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
                Entries close {CLOSE_DATE}
              </p>
              <Countdown className="flex justify-center lg:justify-start" />
            </div>
          </div>

          {/* ------------------------------------------------------- form */}
          <div id="entry-form" className="hero-form relative scroll-mt-20">
            {/* Soft light under the card, clipped by main so it cannot push the
                document sideways. */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] bg-[radial-gradient(60%_60%_at_50%_40%,rgba(194,143,34,0.16),transparent_72%)] blur-2xl"
            />
            <div className="relative rounded-3xl border border-line bg-white p-5 pt-9 shadow-float md:p-7 md:pt-10">
              <HostTag />
              <OptinForm variant="hero" />
            </div>
          </div>

          {/* Supporting proof. Below the form on a phone, under the copy on
              desktop: it is the reason to believe, not the reason to act. */}
          <ul className="hero-points mx-auto max-w-[42ch] space-y-3 text-left lg:mx-0 lg:max-w-none">
            {HERO_POINTS.map((p) => (
              <li
                key={p}
                className="flex gap-3 text-[15.5px] leading-snug text-slate"
              >
                <span
                  aria-hidden
                  className="mt-px flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full bg-green-soft text-[11px] font-bold text-green"
                >
                  &#10003;
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------- prize --------------------------------- */

/* -------------------------- first place, on black ----------------------- */

/**
 * The prize gets its own room.
 *
 * Everything else on this page is light and calm, which is right for a form
 * and wrong for the one number that has to feel like an event. Dropping to
 * black for a single block buys that contrast once, and the embers make it the
 * only moving thing on the page, so it takes the attention it is asking for.
 */
export function FirstPlace() {
  return (
    <section className="py-10 md:py-14">
      <Container>
        {/* A contained panel rather than a full bleed band: inset on the page
            it reads as an object worth looking at, where edge to edge it just
            reads as the page changing colour.

            The gold hairline is what lets this survive the dark variant. There
            the panel is barely darker than the ground, so the border and the
            orbs are the only things drawing its edge.

            Everything inside is pinned to literal #f5f2ea rather than the
            white token: this surface is dark in BOTH variants, and under the
            dark scope --color-white is the card colour, not white. */}
        <div className="relative isolate overflow-hidden rounded-[1.75rem] border border-gold-line/45 bg-ink-deep text-[#f5f2ea] md:rounded-[2.25rem]">
          {/* All three decorative layers sit at NEGATIVE z, behind the panel's
              content rather than merely earlier in the DOM.

              A continuously animating canvas is promoted to its own composited
              layer, and sibling <img> elements that are not promoted get
              painted underneath it: the gold lettering, the cash and the avatar
              all rendered as nothing at all, while text and inline SVG on the
              same layer came through fine. Plain z-index on the content did not
              fix it. Negative z on the decoration does, because it puts these
              behind every in-flow descendant by paint order.

              Back to front: skyline, firelight, embers, then the content. */}
          <Embers className="pointer-events-none absolute inset-0 z-[-5] h-full w-full" />

          {/* Two soft gold masses drifting on separate loops. Both are pushed
              well outside the panel so only their falloff lands on it: a radial
              gradient is brightest at its centre, so leaving the centre on the
              canvas is exactly what makes you see a disc. */}
          <div
            aria-hidden
            className="orb-a pointer-events-none absolute -left-[22rem] -top-[24rem] z-[-20] h-[52rem] w-[52rem] rounded-full bg-[radial-gradient(circle,rgba(220,174,69,0.34)_0%,rgba(220,174,69,0.16)_34%,rgba(220,174,69,0.05)_56%,transparent_74%)] blur-[90px]"
          />
          <div
            aria-hidden
            className="orb-b pointer-events-none absolute -bottom-[20rem] -right-[16rem] z-[-20] h-[46rem] w-[46rem] rounded-full bg-[radial-gradient(circle,rgba(194,143,34,0.30)_0%,rgba(194,143,34,0.14)_34%,rgba(194,143,34,0.04)_58%,transparent_76%)] blur-[90px]"
          />

          <div className="relative z-10 transform-gpu px-6 py-11 md:px-12 md:py-14">
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-14">
              <div className="text-center lg:text-left">
                <p className="inline-flex items-center gap-2 rounded-full bg-gold/[0.14] px-3.5 py-1.5 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-gold-top">
                  First place
                </p>

                {/* Real gold, not a CSS gradient. A bevelled 3D render catches
                    light the way metal does, which a flat two stop gradient
                    cannot, and the sparkles sit over it rather than in it. */}
                <div className="relative mx-auto mt-6 w-full max-w-[440px] lg:mx-0">
                  <img
                    src="/assets/fifty-gold.webp"
                    alt={PRIZE}
                    width={1000}
                    height={307}
                    loading="eager"
                    decoding="async"
                    className="w-full"
                  />
                  <Sparkles />
                </div>

                <p className="mx-auto mt-6 max-w-[42ch] text-[17px] leading-[1.6] text-[#f5f2ea]/75 md:text-[18px] lg:mx-0">
                  Mo puts {PRIZE} of his own money into one business built by
                  someone in this group, for a {PRIZE_EQUITY} stake on terms
                  published before you enter.
                </p>

                {PRIZE_RING_FENCED && (
                  <p className="mt-7 inline-flex items-center gap-2 rounded-full border border-green/30 bg-green/10 px-4 py-2 text-[13.5px] font-medium text-[#f5f2ea]/80">
                    The {PRIZE} is already set aside in a separate account.
                  </p>
                )}
              </div>

              {/* A real cutout now. The previous art had its glow baked in, so
                  it could only be faded in with a radial mask, and the mask was
                  the first thing you saw. */}
              <div className="relative mx-auto w-full max-w-[360px]">
                <img
                  src="/assets/hero-cash.webp"
                  alt=""
                  width={800}
                  height={800}
                  loading="lazy"
                  decoding="async"
                  className="w-full drop-shadow-[0_24px_50px_rgba(0,0,0,0.75)]"
                />
                {/* White, not a smoked pill: against the deepest panel on the
                    page it reads as a real object sitting on the image rather
                    than another layer of the same darkness. The story ring is
                    the one avatar treatment this audience reads instantly as
                    his actual account. */}
                <figure className="absolute -bottom-1 right-0 flex items-center gap-3 rounded-full bg-[#f5f2ea] py-2 pl-2 pr-5 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.8)]">
                  <MoAvatar size={44} gap="bg-[#f5f2ea]" />
                  <figcaption className="flex flex-col leading-none">
                    <span className="flex items-center gap-1">
                      <span className="font-display text-[14px] font-bold tracking-[-0.02em] text-[#14100a]">
                        Mo Vlogs
                      </span>
                      <VerifiedMark className="h-[13px] w-[13px]" />
                    </span>
                    <span className="mt-1.5 text-[12.5px] text-[#14100a]/65">
                      invests personally
                    </span>
                  </figcaption>
                </figure>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ------------------------- the rest of the ladder ----------------------- */

/* A single winner offer depresses conversion: most readers correctly calculate
   they will not win and stop reading. Everyone needs a rung they believe they
   can reach, so first place gets its own section above and these three sit
   together underneath as the prizes that are actually within range. */
const RUNGS = [
  {
    art: "prize-dubai.png",
    tier: "2nd to 5th",
    headline: "Dubai final",
    body: "Flights and hotel for the filmed final, and your app shown in the final episode.",
  },
  {
    art: "prize-camera.png",
    tier: "Top 10",
    headline: "On camera",
    body: "Your app reviewed on camera by Mo or one of the judges on the panel.",
  },
  {
    art: "prize-gallery.png",
    tier: "Top 50",
    headline: "In the gallery",
    body: "Your app published in the public gallery, with a live link anyone can open and use.",
  },
];

export function Prize() {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <h2 className="font-display max-w-[20ch] text-[28px] font-bold leading-[1.12] tracking-[-0.035em] text-ink md:text-[38px]">
          More than one person wins.
        </h2>
        <p className="mt-4 max-w-[52ch] text-[16.5px] leading-[1.6] text-slate">
          You do not have to come first to get something out of this.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {RUNGS.map((r) => (
            <div
              key={r.tier}
              className="relative flex flex-col rounded-3xl border border-line bg-white p-6 shadow-sm"
            >
              {/* Fixed art box so every column's label sits on the same
                  baseline whatever the artwork's own proportions are. */}
              <div className="relative flex h-[128px] items-center justify-center">
                <img
                  src={`/assets/${r.art}`}
                  alt=""
                  width={400}
                  height={400}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-auto object-contain"
                />
              </div>
              <p className="mt-5 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-gold-deep">
                {r.tier}
              </p>
              <p className="font-display mt-2 text-[26px] font-bold leading-none tracking-[-0.035em] text-ink">
                {r.headline}
              </p>
              <p className="mt-3 text-[14.5px] leading-[1.55] text-slate">
                {r.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center md:gap-10">
          {/* The line that keeps this a skill contest. Prize plus chance plus
              consideration is a lottery, and this sentence is what removes
              consideration. It is the one piece of the old rules section that
              could not move to /rules. */}
          <p className="rounded-2xl border border-green/25 bg-green-soft px-5 py-4 text-[15.5px] font-medium leading-[1.55] text-ink">
            Free to enter. You do not buy anything, and buying anything does not
            help you win.
          </p>
          <p className="text-[13.5px] leading-relaxed text-muted">
            Entries close {CLOSE_DATE} and the final is filmed in Dubai on{" "}
            {FINAL_DATE}. Winners must be 18 or over and able to set up a
            company.{" "}
            <a
              href="/rules"
              className="font-medium text-gold-deep underline underline-offset-4 hover:text-ink"
            >
              Full rules
            </a>
          </p>
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------- footer -------------------------------- */

/* ------------------------------ closing call ---------------------------- */

/* The page ends on a ladder of prizes and then a footer, so a reader who
   scrolled the whole thing had nowhere to act without going back up. This is
   the same ask as the top, restated once, on a card rather than on its own
   ground so it stays inside the single background the rest of the page keeps.
   `cta` differs by page: the dark variant opens the dialog, the control jumps
   to the form it already has in the hero. */
export function ClosingCTA({ cta }: { cta: React.ReactNode }) {
  return (
    <section className="pb-4 pt-7 md:pb-6">
      <Container>
        {/* The card clips its own decoration, so the tag cannot live inside it
            and straddle the edge at the same time. An unclipped wrapper holds
            both. */}
        <div className="relative">
          {/* Full Container width, like every other section: inset to 640px it
            read as a leftover module rather than as the page closing.

            Dark in both variants, so everything inside is pinned to literal
            #f5f2ea for the same reason the prize panel is. And the same
            negative z discipline: the ember canvas is composited on its own
            layer, so anything decorative it must not paint over has to sit at
            negative z rather than merely earlier in the DOM.
            Back to front: wall, scrim, orbs, embers, content. */}
          <div className="surface-dark relative isolate overflow-hidden rounded-[1.75rem] border border-gold-line/45 bg-ink-deep text-[#f5f2ea] md:rounded-[2.25rem]">
            {/* The hero's wall, thrown out of focus, but cut to the band where
              EVERY column is screen rather than empty room.

              The full render has black above and below the curve, so any crop
              of it landed on that emptiness at some width and printed a dead
              strip across the top of the card. Chasing it with scale and
              object-position only moved the problem to another breakpoint.
              Measured off the pixels rather than guessed: the screens run
              from about row 112 to row 714 of 762, so the trim takes off the
              empty room and almost nothing else. That matters because the card
              is taller than the strip is proportionally wide, so height is what
              object-cover binds on, and every row cut is magnification added.
              This crop renders the screens at 0.69x where the untrimmed wall
              gave 0.59x, which is as close to the original size as it can be
              without the black coming back.

              The blur is baked into the file rather than applied in CSS. A
              CSS filter promotes the element to its own composited layer, and
              against the ember canvas, which is promoted too, the wall lost
              the ordering and painted as nothing at all. Blurring at build
              also drops a full screen filter from every repaint, and removes
              the scale that only existed to hide the transparency a CSS blur
              pulls in from outside the element.

              The -v2 in the name is deliberate. This file was recut several
              times under one URL, and browsers went on serving whichever
              version they had cached: the two pages rendered the wall at
              different sizes purely because one tab held the older, shorter
              crop and object-cover binds on height. Recutting it again means
              renaming it again. */}
            <img
              src="/assets/wall-strip-v2.jpg"
              alt=""
              aria-hidden
              width={1900}
              height={602}
              loading="lazy"
              decoding="async"
              className="pointer-events-none absolute inset-0 z-[-30] h-full w-full object-cover opacity-[0.55]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-[-25] bg-[radial-gradient(118%_104%_at_50%_50%,rgba(5,5,6,0.68),rgba(5,5,6,0.95))]"
            />

            {/* Pushed outside the panel so only the falloff lands on it. */}
            <div
              aria-hidden
              className="orb-a pointer-events-none absolute -left-[18rem] -top-[20rem] z-[-20] h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle,rgba(220,174,69,0.32)_0%,rgba(220,174,69,0.14)_36%,transparent_72%)] blur-[80px]"
            />
            <div
              aria-hidden
              className="orb-b pointer-events-none absolute -bottom-[18rem] -right-[14rem] z-[-20] h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(194,143,34,0.30)_0%,rgba(194,143,34,0.13)_36%,transparent_74%)] blur-[80px]"
            />

            <Embers className="pointer-events-none absolute inset-0 z-[-5] h-full w-full" />

            <div className="relative z-10 transform-gpu px-6 py-12 text-center md:px-12 md:py-16">
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-[#f5f2ea]/55">
                Entries close {CLOSE_DATE}
              </p>
              <h2 className="font-display mx-auto mt-3 max-w-[18ch] text-balance text-[28px] font-bold leading-[1.12] tracking-[-0.03em] text-[#f5f2ea] md:text-[36px]">
                One idea is all it takes.
              </h2>

              <div className="mt-7 flex justify-center">
                <Countdown variant="light" />
              </div>

              <div className="mt-8 flex justify-center">{cta}</div>

              <SecureNote className="mt-4" />
            </div>
          </div>

          <HostTag />
        </div>
      </Container>
    </section>
  );
}

/* The control has no dialog, so its closing button returns to the hero form
   rather than duplicating a second set of fields at the bottom. */
export function ScrollToForm() {
  return (
    <a
      href="#entry-form"
      className="cta-sweep font-display relative flex min-h-[60px] w-full max-w-[340px] items-center justify-center overflow-hidden rounded-[var(--cta-radius)] bg-[linear-gradient(180deg,var(--cta-from),var(--cta-to))] px-8 text-[16.5px] font-bold uppercase tracking-[0.02em] text-[var(--cta-ink)] shadow-[inset_0_1px_0_var(--cta-lift),var(--cta-glow)] transition hover:brightness-110 active:translate-y-px"
    >
      Enter for free
    </a>
  );
}

export function Footer() {
  return (
    <footer className="pb-14 pt-4">
      <Container>
        {/* On a card, like the prize columns. Loose on the ground the footer
            read as the page having run out rather than as the page closing. */}
        <div className="rounded-3xl border border-line bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            {/* The last thing on the page is the proof of who is behind it. A
                name in text was doing nothing; the face, the tick and the reach
                are what a reader weighs before handing over a number. */}
            <div className="flex items-center gap-3.5">
              <MoAvatar size={54} />
              <div>
                <p className="flex items-center gap-1.5">
                  <span className="font-display text-[16px] font-bold tracking-[-0.02em] text-ink">
                    Mo Vlogs
                  </span>
                  <VerifiedMark className="h-[15px] w-[15px]" />
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] text-muted">
                  <span className="font-medium text-slate">11.9M</span>{" "}
                  subscribers
                  <span className="text-line-2" aria-hidden>
                    /
                  </span>
                  <span className="font-medium text-slate">5.8M</span> on
                  Instagram
                  <span className="text-line-2" aria-hidden>
                    /
                  </span>
                  Dubai
                </p>
              </div>
            </div>

            <p className="flex flex-wrap gap-x-5 gap-y-1 text-[13.5px]">
              <a
                href="/rules"
                className="font-medium text-slate underline underline-offset-4 hover:text-ink"
              >
                Competition rules
              </a>
              <a
                href="/privacy"
                className="font-medium text-slate underline underline-offset-4 hover:text-ink"
              >
                Privacy
              </a>
            </p>
          </div>

          <div className="mt-7 space-y-2.5 border-t border-line pt-6 text-[12.5px] leading-relaxed text-muted">
            <p className="max-w-[78ch]">
              Not affiliated with, endorsed by, or partnered with Base44 or Wix.
              We use the product name to describe the tool we teach.
            </p>
            <p className="max-w-[78ch]">
              Your number is used for this competition and your training
              updates. Never sold. Questions:{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-semibold text-ink hover:underline"
              >
                {SUPPORT_EMAIL}
              </a>
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}

/* -------------------------------- landing -------------------------------- */

export function Landing() {
  return (
    <>
      <TopBar />
      <main>
        <Hero />
        <FirstPlace />
        <Prize />
        <ClosingCTA cta={<ScrollToForm />} />
      </main>
      <Footer />
    </>
  );
}
