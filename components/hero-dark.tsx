import { Container } from "@/components/landing";
import { Countdown } from "@/components/countdown";
import { OpenOptin } from "@/components/open-optin";
import { HostLockup } from "@/components/host-tag";
import { CLOSE_DATE, PRIZE } from "@/lib/tokens";

/* ---------------------------------------------------------------------------
   The dark variant's hero.

   Lifted out of the page so every dark cut shares one hero instead of forking
   it. Two knobs:

     amount    the figure in the headline. Defaults to PRIZE, the approved
               $50,000 cut. null drops the figure and the line promises the
               investment without a number.
     subtitle  "build" is the approved line. "learn" is the more descriptive
               one management asked for: what you learn first, then the money.

   Both default to the approved cut, so /alt-1 renders exactly what it did.
   ------------------------------------------------------------------------- */

const HERO_POINTS = [
  "No coding needed",
  "No experience needed",
  "Free to enter, nothing to buy",
];

export function HeroDark({
  amount = PRIZE,
  subtitle = "build",
}: {
  amount?: string | null;
  subtitle?: "build" | "learn";
}) {
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
          {/* The figure is the whole line in the approved cut. Without it the
              line has to carry the promise on its own, so it names who is
              investing and in whom rather than how much. */}
          {amount ? (
            <span className="hl-gold" data-text={`I invest ${amount}.`}>
              I invest {amount}.
            </span>
          ) : (
            <span className="hl-gold" data-text="I invest in one of you.">
              I invest in one of you.
            </span>
          )}
        </h1>

        <p className="mx-auto mt-5 max-w-[52ch] text-pretty text-[17px] leading-[1.55] text-ink md:text-[20px]">
          {/* "learn" never repeats the figure: the headline right above it
              already says it, and saying it twice reads as a stammer. */}
          {subtitle === "build" ? (
            <>
              Build anything you want without writing code, and Mo invests{" "}
              <span className="font-semibold text-gold">
                {amount ?? "his own money"}
              </span>{" "}
              {amount ? "of his own money " : ""}in one of them.
            </>
          ) : (
            <>
              Learn to build a real app or website without writing a single line
              of code. Mo invests{" "}
              <span className="font-semibold text-gold">his own money</span> in
              the best one.
            </>
          )}
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
            <li
              key={p}
              className="flex items-center gap-2.5 text-[14.5px] leading-snug text-slate"
            >
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
