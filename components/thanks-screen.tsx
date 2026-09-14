"use client";

import { useCallback, useState } from "react";
import { HostTag } from "@/components/host-tag";
import { inboxUrl, useLead } from "@/components/lead";
import { MESSAGING, SUPPORT_EMAIL } from "@/lib/tokens";

/* ---------------------------------------------------------------------------
   THE THANK YOU.

   One job above all others: make the phone get answered. Most of this
   audience will not pick up an unknown number, and branded caller ID does not
   exist in the regions it lives in, so this page IS the caller ID. Everything
   on it either says "that call is us" or makes the call better.

   Kept deliberately short, like the page that sends people here. It says
   nothing about the prize: the approved test runs without a figure or terms,
   and the confirmation is the last place a number should sneak back in.

   Token driven, so it renders in either theme. The dark variant adds the wall
   from the hero behind the top of the page, which is what makes it read as
   the next screen of the same thing rather than a generic receipt.
   ------------------------------------------------------------------------- */

function PhoneIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path
        d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 006 6l1.5-2 4 1.5v3a1.5 1.5 0 01-1.6 1.5A16.5 16.5 0 015 5.1 1.5 1.5 0 016.5 3.5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Two rings a half beat apart, so it reads as ringing rather than a heartbeat. */
function Ringing() {
  return (
    <span className="relative mx-auto flex h-[72px] w-[72px] items-center justify-center">
      <span
        aria-hidden
        className="ringpulse absolute inset-0 rounded-full border-2 border-green"
      />
      <span
        aria-hidden
        className="ringpulse absolute inset-0 rounded-full border-2 border-green [animation-delay:1.05s]"
      />
      <span className="relative flex h-full w-full items-center justify-center rounded-full bg-green-soft ring-1 ring-green/30">
        <PhoneIcon className="h-8 w-8 text-green" />
      </span>
    </span>
  );
}

/* The page's one button shape. Same tokens as every other CTA on the site, so
   it is pill shaped on the dark variant and 16px on the light one. */
const PRIMARY =
  "font-display flex min-h-[54px] flex-1 items-center justify-center rounded-[var(--cta-radius)] bg-[linear-gradient(180deg,var(--cta-from),var(--cta-to))] px-5 text-[15.5px] font-bold text-[var(--cta-ink)] shadow-[inset_0_1px_0_var(--cta-lift),var(--cta-glow)] transition hover:brightness-110 active:translate-y-px";
const SECONDARY =
  "flex min-h-[54px] flex-1 items-center justify-center rounded-[var(--cta-radius)] border border-line-2 px-5 text-[15px] font-medium text-ink transition hover:border-gold";

const CARD = "rounded-3xl border border-line bg-white p-6 md:p-9";

export function ThanksScreen({ dark = false }: { dark?: boolean }) {
  const { id, firstName, email, last2 } = useLead();
  const inbox = inboxUrl(email);

  const [age, setAge] = useState<"unset" | "adult" | "minor">("unset");
  const [idea, setIdea] = useState("");
  const [ideaSaved, setIdeaSaved] = useState(false);

  /** Fire and forget. Never surfaces an error: the lead already exists. */
  const patch = useCallback(
    (body: Record<string, string | boolean>) => {
      if (!id) return;
      fetch("/api/lead", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({ id, ...body }),
      }).catch(() => {});
    },
    [id],
  );

  return (
    <main className="relative isolate overflow-hidden">
      {dark && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px]"
        >
          <img
            src="/assets/wall-strip-v2.jpg"
            alt=""
            width={1900}
            height={602}
            className="h-full w-full object-cover opacity-[0.3]"
          />
          <div className="absolute inset-0 bg-[radial-gradient(70%_80%_at_50%_30%,rgba(10,10,11,0.2),var(--color-surface)_78%)]" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-[linear-gradient(to_bottom,transparent,var(--color-surface))]" />
        </div>
      )}

      {/* Container's own classes, inlined: importing it from landing.tsx
          would pull the whole landing module into this client bundle. */}
      <div className="mx-auto w-full max-w-[70rem] px-5 pb-10 pt-14 md:px-8 md:pb-14 md:pt-20">
        {/* ------------------------------------------------ confirmation */}
        {/* A minor is not in and will not be called, so the confirmation and
            its "we're calling you" line go with the call card. Left in place
            they sat directly above "we won't phone you". */}
        {age !== "minor" && (
          <section className="mx-auto max-w-[640px] text-center">
            <Ringing />

            <p className="mt-7 text-[12px] font-semibold uppercase tracking-[0.16em] text-green">
              You&rsquo;re on the list
            </p>

            {/* The name is inserted after mount, since it lives in
                sessionStorage and the server cannot see it. Inserted rather than
                reserved: an invisible placeholder held the width open and, for
                the length of the fade, printed "You're in       ." with a hole
                in the middle. One reflow of a centred line is the better cost. */}
            <h1 className="font-display mt-3 text-balance text-[38px] font-bold leading-[1.06] tracking-[-0.035em] text-ink md:text-[54px]">
              You&rsquo;re in
              {firstName && <span className="fade-in">, {firstName}</span>}.
            </h1>

            <p className="mx-auto mt-4 max-w-[34ch] text-pretty text-[17px] leading-[1.55] text-ink md:text-[20px]">
              Keep your phone close. Mo&rsquo;s team is calling you in the next
              few minutes.
            </p>

            <p role="status" className="sr-only">
              You are on the list. Someone from Mo&rsquo;s team will call you in
              the next few minutes.
            </p>

            {email && (
              <p className="mx-auto mt-6 inline-flex max-w-full items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-[13px] text-slate">
                <svg
                  viewBox="0 0 20 20"
                  className="h-4 w-4 shrink-0 text-gold"
                  fill="none"
                  aria-hidden
                >
                  <rect
                    x="2.5"
                    y="4.5"
                    width="15"
                    height="11"
                    rx="1.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M3 6l7 5 7-5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="truncate">
                  Build Pack sent to{" "}
                  {inbox ? (
                    <a
                      href={inbox}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-ink underline underline-offset-2"
                    >
                      {email}
                    </a>
                  ) : (
                    <span className="font-medium text-ink">{email}</span>
                  )}
                </span>
              </p>
            )}
          </section>
        )}

        {/* -------------------------------------------------------- the call */}
        {age !== "minor" && (
          <section className="relative mx-auto mt-16 max-w-[640px]">
            {/* The lockup on the card's edge answers the question the unknown
                number raises: is this really him. Same placement as on the
                closing section, so it reads as the same object. */}
            <div className={`${CARD} pt-12 text-center md:pt-14`}>
              <h2 className="font-display text-balance text-[24px] font-bold leading-[1.15] tracking-[-0.025em] text-ink md:text-[30px]">
                It will come from a number you don&rsquo;t know.
              </h2>
              <p className="mx-auto mt-3 max-w-[40ch] text-pretty text-[16px] leading-[1.6] text-slate md:text-[17px]">
                That&rsquo;s us, so please pick up. We&rsquo;ll help you enter
                and answer anything you want to ask.
              </p>

              <ul className="mt-6 flex flex-wrap justify-center gap-2">
                {["Free", "No obligation", "About 15 minutes"].map((t) => (
                  <li
                    key={t}
                    className="rounded-full border border-line bg-surface-2 px-3.5 py-1.5 text-[13px] text-slate"
                  >
                    {t}
                  </li>
                ))}
              </ul>

              {last2 && (
                <p className="mt-7 text-[14.5px] text-slate">
                  We&rsquo;ll call the number ending in{" "}
                  <span className="font-display font-bold tabular-nums text-ink">
                    {last2}
                  </span>
                </p>
              )}
              <p className="mx-auto mt-2 max-w-[44ch] text-[13px] leading-relaxed text-muted">
                Missed it? We&rsquo;ll try once more, then{" "}
                {MESSAGING === "email" ? "email" : "message"} you so you can
                pick a better time.
              </p>
            </div>

            <HostTag />
          </section>
        )}

        {/* -------------------------------------------- one thing before */}
        <section
          className={`mx-auto max-w-[640px] ${age === "minor" ? "" : "mt-6"}`}
        >
          <div className={CARD}>
            {age === "unset" && (
              <>
                <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-gold">
                  One thing before we call
                </p>
                <h2 className="font-display mt-2 text-[21px] font-bold tracking-[-0.02em] text-ink md:text-[24px]">
                  Are you 18 or over?
                </h2>
                <p className="mt-1.5 text-[15px] leading-[1.6] text-slate">
                  We have to ask. The investment goes into a real company, and
                  you have to be old enough to own one.
                </p>
                <div className="mt-5 flex gap-2.5">
                  <button
                    type="button"
                    className={PRIMARY}
                    onClick={() => {
                      setAge("adult");
                      patch({ ageConfirmed: true });
                    }}
                  >
                    Yes, I&rsquo;m 18+
                  </button>
                  <button
                    type="button"
                    className={SECONDARY}
                    onClick={() => {
                      setAge("minor");
                      patch({ ageConfirmed: false });
                    }}
                  >
                    No, I&rsquo;m under 18
                  </button>
                </div>
              </>
            )}

            {age === "adult" && (
              <>
                <p className="flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-green">
                  <span aria-hidden>&#10003;</span> You&rsquo;re eligible
                </p>
                <h2 className="font-display mt-2 text-[21px] font-bold tracking-[-0.02em] text-ink md:text-[24px]">
                  What do you want to build?
                </h2>
                <p className="mt-1.5 text-[15px] leading-[1.6] text-slate">
                  One or two sentences is plenty. Whoever calls you reads this
                  first, so the call starts somewhere useful.
                </p>
                <textarea
                  value={idea}
                  onChange={(e) => {
                    setIdea(e.target.value);
                    setIdeaSaved(false);
                  }}
                  onBlur={() => {
                    if (idea.trim().length > 2) {
                      patch({ ideaText: idea });
                      setIdeaSaved(true);
                    }
                  }}
                  rows={4}
                  maxLength={2000}
                  placeholder="An app for my dad's shop so customers can book a slot instead of calling"
                  aria-label="What do you want to build?"
                  className="mt-5 w-full resize-none rounded-2xl border border-line-2 bg-surface-2 px-4 py-3.5 text-[16px] leading-relaxed text-ink placeholder:text-muted focus:border-gold focus:outline-none"
                />
                {ideaSaved && (
                  <p
                    className="mt-2.5 text-[13.5px] font-semibold text-green"
                    role="status"
                  >
                    &#10003; Saved. That&rsquo;s all we needed.
                  </p>
                )}
              </>
            )}

            {age === "minor" && (
              <>
                <h2 className="font-display text-[21px] font-bold tracking-[-0.02em] text-ink md:text-[24px]">
                  Then this one isn&rsquo;t for you yet.
                </h2>
                <p className="mt-2 text-[15px] leading-[1.6] text-slate">
                  You have to be 18 to enter, because the prize is an investment
                  into a company you own. We&rsquo;ve taken you off the call
                  list and we won&rsquo;t phone you.
                </p>
                <p className="mt-3 text-[15px] leading-[1.6] text-slate">
                  Nothing stops you building, though. Base44 has a free plan,
                  and the Build Pack in your inbox works just as well at
                  sixteen.
                </p>
                <p className="mt-4 text-[13px] text-muted">
                  Want your details deleted now? Email{" "}
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="text-slate underline underline-offset-2 hover:text-ink"
                  >
                    {SUPPORT_EMAIL}
                  </a>{" "}
                  and we&rsquo;ll do it the same day.
                </p>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
