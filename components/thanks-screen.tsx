"use client";

import { useCallback, useState } from "react";
import { inboxUrl, useLead } from "@/components/lead";
import { CLOSE_DATE, MESSAGING, SUPPORT_EMAIL } from "@/lib/tokens";

/* ---------------------------------------------------------------------------
   PAGE 2 — THE THANK YOU.

   One job above all others: make the phone get answered. Answer rate on the
   first dial is the number this whole account lives on.

   Everything else on the page is progressive profiling, and none of it may
   block or fail the visitor — the lead is already banked, so a failed PATCH
   costs us a sort key, not a lead. The age gate is the one exception: it gates
   ENTRY, not the call information, which stays visible at the top no matter
   what. See docs/build-challenge-spec.html §05.
   ------------------------------------------------------------------------- */

function PhoneIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path
        d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 006 6l1.5-2 4 1.5v3a1.5 1.5 0 01-1.6 1.5A16.5 16.5 0 015 5.1 1.5 1.5 0 016.5 3.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-gold-deep">
      {children}
    </p>
  );
}

const CALL_COVERS = [
  "What you want to build, and whether it fits",
  "How to enter, step by step",
  "What the free training covers",
  "Anything you want to ask",
];

const BUILD_FOR = [
  "My own business idea",
  "Someone else’s business",
  "A job or career change",
  "I don’t know yet",
];

const TIME_AVAILABLE = ["A few hours a week", "Most evenings", "Full time", "Not sure yet"];

/** Chip row. Ungated on purpose: nothing here blocks, everything sorts. */
function Chips({
  name,
  options,
  value,
  onPick,
}: {
  name: string;
  options: readonly string[];
  value: string | null;
  onPick: (v: string) => void;
}) {
  return (
    <div role="group" aria-label={name} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value === o;
        return (
          <button
            key={o}
            type="button"
            aria-pressed={on}
            onClick={() => onPick(o)}
            className={`rounded-full border px-3.5 py-2 text-[13.5px] transition ${
              on
                ? "border-ink bg-ink text-white font-semibold"
                : "border-line bg-white text-ink hover:border-gold"
            }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

export function ThanksScreen() {
  const { id, firstName, email, last2 } = useLead();
  const inbox = inboxUrl(email);

  const [age, setAge] = useState<"unset" | "adult" | "minor">("unset");
  const [idea, setIdea] = useState("");
  const [ideaSaved, setIdeaSaved] = useState(false);
  const [buildFor, setBuildFor] = useState<string | null>(null);
  const [timeAvail, setTimeAvail] = useState<string | null>(null);
  const [bestTime, setBestTime] = useState("");

  /** Fire-and-forget. Never surfaces an error: the lead already exists. */
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
    <main className="mx-auto w-full max-w-[46rem] px-5 pb-20 md:px-8">
      {/* ------------------------------------------------ the phone, first */}
      <section className="pt-8">
        <div className="flex items-center gap-3.5 rounded-2xl border border-green/25 bg-green-soft px-5 py-4">
          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center">
            <span aria-hidden className="ringpulse absolute inset-0 rounded-full border border-green" />
            <span className="relative flex h-full w-full items-center justify-center rounded-full bg-white">
              <PhoneIcon className="h-5 w-5 text-green" />
            </span>
          </span>
          <p className="text-[15.5px] font-semibold leading-snug text-ink">
            Keep your phone close. Someone from Mo&rsquo;s team is calling you.
          </p>
        </div>

        <p role="status" className="sr-only">
          You are on the list. Your Build Pack is on its way by email, and
          someone will call you shortly.
        </p>

        <h1 className="font-display mt-7 text-[29px] font-extrabold leading-[1.12] tracking-[-0.035em] text-ink">
          You&rsquo;re in
          <span className={firstName ? "opacity-100" : "opacity-0"}>
            {firstName ? `, ${firstName}` : ""}
          </span>
          .
        </h1>
        <p className="mt-3 text-[16.5px] leading-[1.6] text-slate">
          Your Build Pack is on its way to your inbox right now. Two quick things
          below finish your entry. They take about thirty seconds, and they make
          your call much more useful.
        </p>

        {email && (
          <p className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-[12.5px] text-slate">
            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 shrink-0 text-gold-deep" fill="none" aria-hidden>
              <rect x="2.5" y="4.5" width="15" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3 6l7 5 7-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="truncate">Sent to {email}</span>
          </p>
        )}
      </section>

      {/* ------------------------------------------------------- age gate */}
      <section className="pt-10">
        <Label>Step 1 of 2 &middot; Finish your entry</Label>
        {age === "unset" && (
          <div className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="font-display text-[18px] font-bold tracking-[-0.02em] text-ink">Are you 18 or over?</h2>
            <p className="mt-1.5 text-[15px] leading-[1.6] text-slate">
              We have to ask. The investment goes into a real company, and you
              have to be able to own one.
            </p>
            <div className="mt-4 flex gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setAge("adult");
                  patch({ ageConfirmed: true });
                }}
                className="flex-1 rounded-2xl bg-[linear-gradient(180deg,var(--cta-from),var(--cta-to))] text-[var(--cta-ink)] shadow-[inset_0_1px_0_var(--cta-lift),0_14px_30px_-12px_var(--cta-shadow)] transition hover:brightness-110 active:translate-y-px px-4 py-3.5 text-[15px] font-bold"
              >
                Yes, I&rsquo;m 18+
              </button>
              <button
                type="button"
                onClick={() => {
                  setAge("minor");
                  patch({ ageConfirmed: false });
                }}
                className="flex-1 rounded-2xl border border-line bg-white px-4 py-3.5 text-[15px] font-medium text-ink transition hover:border-gold"
              >
                No, under 18
              </button>
            </div>
          </div>
        )}

        {age === "minor" && (
          <div className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="font-display text-[18px] font-bold tracking-[-0.02em] text-ink">
              Then this one is not for you yet.
            </h2>
            <p className="mt-2 text-[15px] leading-[1.6] text-slate">
              You have to be 18 to enter, because the prize is an investment
              into a company you own. We have taken you off the call list and we
              will not phone you.
            </p>
            <p className="mt-3 text-[15px] leading-[1.6] text-slate">
              Nothing stops you building, though. Base44 has a free plan and the
              Build Pack in your inbox works just as well at sixteen. Come back
              when you turn 18, because there will be another season.
            </p>
            <p className="mt-3 text-[13px] text-muted">
              Want your details deleted now? Email{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-slate underline underline-offset-2 hover:text-ink">
                {SUPPORT_EMAIL}
              </a>{" "}
              and we will do it same day.
            </p>
          </div>
        )}

        {age === "adult" && (
          <div className="flex items-center gap-2.5 rounded-xl border border-green/25 bg-green-soft px-4 py-3 text-[14.5px] font-medium text-ink">
            <span aria-hidden>&#10003;</span> Confirmed. You&rsquo;re eligible to
            enter.
          </div>
        )}
      </section>

      {/* Everything below is for eligible entrants only. */}
      {age === "adult" && (
        <>
          {/* ------------------------------------------ the micro-commitment */}
          <section className="pt-10">
            <Label>Step 2 of 2 &middot; The only question that matters</Label>
            <div className="rounded-2xl border border-gold-line bg-gold-soft p-6">
              <h2 className="font-display text-[20px] font-bold leading-tight tracking-[-0.02em] text-ink">
                What do you want to build?
              </h2>
              <p className="mt-1.5 text-[15px] leading-[1.6] text-slate">
                One or two sentences is plenty. Whoever calls you will have read
                this before they dial, so the call starts somewhere useful
                instead of at the beginning.
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
                placeholder="An app for my dad’s shop so customers can book a slot instead of calling…"
                aria-label="What do you want to build?"
                className="mt-4 w-full rounded-xl border border-line-2 bg-white px-4 py-3.5 text-[16px] leading-relaxed text-ink placeholder:text-muted focus:border-gold focus:outline-none"
              />
              {ideaSaved && (
                <p className="mt-2 text-[13px] font-medium text-green" role="status">
                  &#10003; Saved. That is all we needed.
                </p>
              )}
            </div>
          </section>

          {/* ------------------------------------------------ one-tap sorting */}
          <section className="pt-10">
            <Label>Three taps, if you have a moment</Label>

            <p className="mb-3 text-[15px] font-medium text-ink">
              Who are you building for?
            </p>
            <Chips
              name="Who are you building for?"
              options={BUILD_FOR}
              value={buildFor}
              onPick={(v) => {
                setBuildFor(v);
                patch({ buildFor: v });
              }}
            />

            <p className="mb-3 mt-7 text-[15px] font-medium text-ink">
              How much time can you give it?
            </p>
            <Chips
              name="How much time can you give it?"
              options={TIME_AVAILABLE}
              value={timeAvail}
              onPick={(v) => {
                setTimeAvail(v);
                patch({ timeAvailable: v });
              }}
            />

            <p className="mb-3 mt-7 text-[15px] font-medium text-ink">
              When is a good time to call?
            </p>
            {/* Hand-typed, not a dropdown: people write "after 6, I'm at work"
                and that is worth more than any time slot we could offer. */}
            <input
              type="text"
              value={bestTime}
              onChange={(e) => setBestTime(e.target.value)}
              onBlur={() => bestTime.trim() && patch({ bestTime })}
              placeholder="After 6pm, I’m at work before that"
              aria-label="When is a good time to call?"
              className="w-full rounded-xl border border-line-2 bg-surface-2 px-4 py-3.5 text-[16px] text-ink placeholder:text-muted focus:bg-white focus:border-gold focus:outline-none"
            />
          </section>
        </>
      )}

      {/* ------------------------------------------------------- the call */}
      {age !== "minor" && (
        <section className="pt-12">
          <div className="rounded-2xl border border-line bg-surface p-6 md:p-8">
            <div className="relative mx-auto flex h-12 w-12 items-center justify-center">
              <span aria-hidden className="ringpulse absolute inset-0 rounded-full border border-gold" />
              <span className="relative flex h-full w-full items-center justify-center rounded-full border border-gold-line bg-white">
                <PhoneIcon className="h-5 w-5 text-gold-deep" />
              </span>
            </div>

            <h2 className="font-display mt-5 text-center text-[22px] font-bold leading-tight tracking-[-0.02em] text-ink">
              It will come from a number you don&rsquo;t know.
            </h2>
            <p className="mt-3 text-center text-[15.5px] leading-[1.6] text-slate">
              That is us, so please pick up. Usually within a few minutes. If
              you entered outside our hours, your call comes first thing.
            </p>

            <ul className="mx-auto mt-6 max-w-sm space-y-2.5">
              {CALL_COVERS.map((c) => (
                <li key={c} className="flex items-start gap-2.5 text-[15px] leading-snug text-slate">
                  <span aria-hidden className="mt-0.5 shrink-0 text-green">
                    &#10003;
                  </span>
                  {c}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {["Free", "No obligation", "About 15 minutes"].map((p) => (
                <span
                  key={p}
                  className="rounded-full border border-line bg-white px-3.5 py-1.5 text-[12.5px] text-slate"
                >
                  {p}
                </span>
              ))}
            </div>

            {last2 && (
              <p className="mt-7 text-center text-[13.5px] font-medium text-ink">
                We&rsquo;ll call the number ending in {last2}.
              </p>
            )}
            <p className="mx-auto mt-2 max-w-sm text-center text-[13px] leading-relaxed text-muted">
              If we miss you we&rsquo;ll try once more, then{" "}
              {MESSAGING === "email" ? "email" : "message"} you so you can pick a
              better time. Nothing is lost either way.
            </p>
          </div>
        </section>
      )}

      {/* ------------------------------------------------- start tonight */}
      {age !== "minor" && (
        <section className="pt-10">
          <Label>You don&rsquo;t have to wait for the call</Label>
          <h2 className="font-display text-[20px] font-bold leading-tight tracking-[-0.02em] text-ink">
            Start tonight, for free.
          </h2>
          <p className="mt-2 text-[15px] leading-[1.6] text-slate">
            Open your Build Pack and try the first prompt in it. Base44 gives you a
            free plan to play with, enough to see your idea turn into something
            real on screen. Entries close {CLOSE_DATE}, and the
            people who do well start before anybody tells them to.
          </p>
          {inbox && (
            <a
              href={inbox}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block rounded-2xl bg-[linear-gradient(180deg,var(--cta-from),var(--cta-to))] text-[var(--cta-ink)] shadow-[inset_0_1px_0_var(--cta-lift),0_14px_30px_-12px_var(--cta-shadow)] transition hover:brightness-110 active:translate-y-px px-7 py-3.5 text-[15px] font-bold"
            >
              Open your inbox &rarr;
            </a>
          )}
        </section>
      )}

      <footer className="mt-14 border-t border-line pt-7 text-[12.5px] leading-relaxed text-muted">
        <p>
          Your number is used for this competition and your training updates.
          Never sold. Questions:{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-slate underline underline-offset-2 hover:text-ink">
            {SUPPORT_EMAIL}
          </a>
        </p>
        <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
          <a href="/rules" className="text-slate underline underline-offset-2 hover:text-ink">
            Competition rules
          </a>
          <a href="/privacy" className="text-slate underline underline-offset-2 hover:text-ink">
            Privacy
          </a>
        </p>
      </footer>

      {/* Information only, no CTA. They have already converted; the only job
          left is making the phone get answered. */}
      {age !== "minor" && (
        <div className="fixed inset-x-0 bottom-0 z-40 sm:hidden">
          <div className="flex items-center justify-center gap-2 border-t border-line bg-white/95 px-4 pb-[calc(0.6rem+env(safe-area-inset-bottom))] pt-2.5 backdrop-blur">
            <PhoneIcon className="h-4 w-4 shrink-0 text-gold-deep" />
            <p className="text-[13px] font-semibold text-ink">
              Keep your phone close. We&rsquo;re calling shortly.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
