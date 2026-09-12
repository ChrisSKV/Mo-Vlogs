import type { Metadata } from "next";
import {
  ClosingCTA,
  Container,
  FirstPlace,
  Footer,
  Prize,
  TopBar,
} from "@/components/landing";
import { Countdown } from "@/components/countdown";
import { OptinModalProvider } from "@/components/optin-modal";
import { OpenOptin } from "@/components/open-optin";
import { HostLockup } from "@/components/host-tag";
import { CLOSE_DATE, PRIZE } from "@/lib/tokens";

export const metadata: Metadata = {
  title: "The Build Challenge | Mo Vlogs",
  description:
    "You have the idea. AI builds it for you. Free to enter, and Mo invests his own money in one business from this group.",
  // A variant must never compete with the control in search.
  robots: { index: false, follow: false },
};

/* ---------------------------------------------------------------------------
   VARIANT B — DARK, STAGED.

   Not a recolour of the control. The control puts the promise and the form
   side by side and sells while you read; this one gives the whole first screen
   to a single image and asks for one tap.

   Mo stands in front of a wall of running apps, which is the argument the
   headline is making, made visually: the thing being sold is that software
   like this is now something you can just have. The form moves into a dialog,
   so the opening frame is an image rather than three empty fields.

   That trade is the point of the test: does this audience need the form in
   front of them, or are they sold before they go looking for it.
   ------------------------------------------------------------------------- */

const HERO_POINTS = [
  "No coding needed",
  "No experience needed",
  "Free to enter, nothing to buy",
];

function HeroDark() {
  return (
    <section className="relative">
      {/* The stage is its own band, and the headline sits under it rather than
          over it. Type laid across a photograph was what made the first pass
          look like a collage: the reference keeps the image whole and starts
          the words below it. */}
      <div className="relative h-[286px] overflow-hidden sm:h-[350px] md:h-[440px]">
        {/* Dimmed at build time rather than with a runtime filter: blurring a
            1900px image on every repaint is a real cost on the mid range
            Android this page is mostly read on. */}
        <img
          src="/assets/app-wall.jpg"
          alt=""
          aria-hidden
          width={1900}
          height={764}
          className="absolute inset-0 h-full w-full object-cover object-[50%_46%]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(72%_96%_at_50%_44%,transparent_8%,color-mix(in_srgb,var(--color-surface)_88%,transparent)_58%,var(--color-surface)_97%)]"
        />

        {/* Sized past the band and then dropped below it: at 104% height with
            a 9% negative offset his head keeps about 5% of clearance at the
            top while he stays as large as the band allows, and the crop at his
            thigh lands inside the bottom fade. Both values are percentages of
            the band, so this holds at every breakpoint. */}
        <img
          src="/assets/mo-hero.webp"
          alt="Mo Vlogs"
          width={700}
          height={1392}
          className="absolute -bottom-[9%] left-1/2 h-[104%] w-auto -translate-x-1/2 [filter:drop-shadow(0_0_44px_rgba(220,174,69,0.12))_drop-shadow(0_20px_44px_rgba(0,0,0,0.85))]"
        />

        {/* Last, so it melts both the image and him into the page at once. */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(to_bottom,transparent,var(--color-surface)_88%)]"
        />
      </div>

      <Container className="relative z-10 -mt-14 pb-16 text-center md:-mt-20 md:pb-20">
        {/* Out of the dialog and up here: the first question this audience
            asks is whether the page is actually his, and it was only being
            answered one tap in. Now it is answered before the promise. */}
        <HostLockup className="mb-6" />

        <h1 className="font-display mx-auto max-w-[16ch] text-[37px] font-bold leading-[1.08] tracking-[-0.035em] text-ink md:max-w-[20ch] md:text-[50px]">
          You have the idea.
          <br />
          AI builds it for you.
          <br />
          {/* data-text feeds the blurred clone behind the line: a text-shadow
              that wide would smear the gradient, a duplicated blurred copy
              leaves the letterforms crisp. */}
          <span className="hl-gold" data-text={`I invest ${PRIZE}.`}>
            I invest {PRIZE}.
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-[52ch] text-pretty text-[17px] leading-[1.55] text-ink md:text-[20px]">
          Build anything you want without writing code, and Mo invests{" "}
          <span className="font-semibold text-gold">{PRIZE}</span> of his own
          money in one of them.
        </p>

        <div className="mt-8 flex flex-col items-center">
          <OpenOptin />
        </div>

        <div className="mt-7 flex flex-col items-center">
          <p className="mb-2.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
            Entries close {CLOSE_DATE}
          </p>
          <Countdown />
        </div>

        <ul className="mx-auto mt-8 flex max-w-[52rem] flex-wrap items-center justify-center gap-x-7 gap-y-3">
          {HERO_POINTS.map((p) => (
            <li key={p} className="flex items-center gap-2.5 text-[14.5px] leading-snug text-slate">
              <span
                aria-hidden
                className="flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full bg-green-soft text-[11px] font-bold text-green"
              >
                &#10003;
              </span>
              {p}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

export default function AltPage() {
  return (
    <div className="theme-dark min-h-screen">
      <OptinModalProvider>
        <TopBar />
        <main>
          <HeroDark />
          <FirstPlace />
          <Prize />
          <ClosingCTA cta={<OpenOptin />} />
        </main>
        <Footer />
      </OptinModalProvider>
    </div>
  );
}
