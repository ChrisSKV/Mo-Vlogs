"use client";

import { useRef, useState } from "react";
import PhoneInput, { type PhoneValue } from "@/components/phone-input";
import { newId, stashLead, trafficSource } from "@/components/lead";
import { COMPANY } from "@/lib/tokens";
import { SecureNote } from "@/components/secure-note";
import { EntryCount } from "@/components/entry-count";

/* Fields sit ON the card rather than in it: a tinted well with a hairline,
   which reads as a place to type without the heavy outlined-box look. 16px
   text or iOS zooms the page on focus. */
const FIELD =
  "w-full rounded-xl border bg-surface-2 px-4 py-3.5 text-[16px] text-ink placeholder:text-muted transition focus:bg-white focus:outline-none";
const OK = "border-line-2 focus:border-gold";
const BAD = "border-red";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Errors = { firstName?: string; email?: string; phone?: string };

function FieldError({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return (
    <p id={id} className="mt-1.5 px-1 text-[13px] text-red">
      {msg}
    </p>
  );
}

/**
 * The only conversion point on the site. One step, three fields, no OTP, no
 * captcha, no country dropdown before the button.
 */
export default function OptinForm({ variant = "hero" }: { variant?: "hero" | "foot" }) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState<PhoneValue>({ e164: "", isValid: false, country: "AE" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  // Per-field errors only after a submit attempt: validating mid-word scolds.
  const [errors, setErrors] = useState<Errors>({});
  const idRef = useRef<string>("");

  const uid = variant === "hero" ? "h" : "f";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    const fn = firstName.trim();
    const em = email.trim();
    const next: Errors = {};
    if (fn.length < 2) next.firstName = "Enter your first name.";
    if (!EMAIL_RE.test(em)) next.email = "Enter a valid email address.";
    if (!phone.isValid) next.phone = "Enter a valid phone number for your country.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    setError("");

    if (!idRef.current) idRef.current = newId();
    const id = idRef.current;

    // Stash BEFORE the request. If the network is slow and the visitor taps
    // away, the thank-you page still greets them properly.
    stashLead({ id, firstName: fn, email: em, phone: phone.e164 });

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // keepalive: the redirect fires while this is in flight, and without
        // it the navigation cancels the request on slow connections.
        keepalive: true,
        body: JSON.stringify({
          id,
          firstName: fn,
          email: em,
          phone: phone.e164,
          source: trafficSource(),
        }),
      });
      if (res.status === 422) {
        setError("Please check your details and try again.");
        setSubmitting(false);
        return;
      }
    } catch {
      // Swallowed on purpose. The lead is stashed, the API is fail-open, and
      // sending someone to an error page costs more than a possibly-lost row.
    }

    window.location.href = "/thanks";
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="text-center">
        <p className="font-display text-[19px] font-bold tracking-[-0.02em] text-ink">
          Enter the Build Challenge
        </p>
        <p className="mt-1 text-[13.5px] text-muted">Free &middot; takes 30 seconds</p>
      </div>

      <div className="mt-5 space-y-2.5">
        <div>
          <label htmlFor={`${uid}-first-name`} className="sr-only">
            First name
          </label>
          <input
            id={`${uid}-first-name`}
            name="first_name"
            type="text"
            required
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              setErrors((p) => (p.firstName ? { ...p, firstName: undefined } : p));
            }}
            placeholder="First name"
            autoComplete="given-name"
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? `${uid}-first-name-error` : undefined}
            className={`${FIELD} ${errors.firstName ? BAD : OK}`}
          />
          <FieldError id={`${uid}-first-name-error`} msg={errors.firstName} />
        </div>

        <div>
          <label htmlFor={`${uid}-email`} className="sr-only">
            Email address
          </label>
          <input
            id={`${uid}-email`}
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((p) => (p.email ? { ...p, email: undefined } : p));
            }}
            placeholder="Email address"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? `${uid}-email-error` : undefined}
            className={`${FIELD} ${errors.email ? BAD : OK}`}
          />
          <FieldError id={`${uid}-email-error`} msg={errors.email} />
        </div>

        <div>
          <label htmlFor={`${uid}-phone`} className="sr-only">
            Phone number
          </label>
          <PhoneInput
            id={`${uid}-phone`}
            invalid={!!errors.phone}
            ariaDescribedby={errors.phone ? `${uid}-phone-error` : undefined}
            onChange={(v) => {
              setPhone(v);
              setErrors((p) => (p.phone ? { ...p, phone: undefined } : p));
            }}
          />
          <FieldError id={`${uid}-phone-error`} msg={errors.phone} />
        </div>
      </div>

      {/* The highest-leverage copy block on the form. It reframes the phone
          number from a toll into a delivery address, names a real deliverable,
          discloses that a paid programme exists BEFORE consent is given, and
          pre-frames the call so the dial is expected rather than an ambush.
          Aagaard's form test: explanation beats deletion. */}
            {/* text-pretty, not text-balance. Balance equalises the lines by
          NARROWING the block, which pulled it in off the fields and left a
          pinched middle line. Pretty keeps the lines full width and only
          guards the last one against being left as an orphan. The closing
          clause is nowrap so it drops to the last line whole: split across two
          lines it left "stays free." dangling on its own. */}
      <p className="mt-3.5 text-pretty text-center text-[13px] leading-[1.5] text-muted">
        Your Build Pack goes to your email. Then Mo&rsquo;s team calls to help
        you enter, and to tell you about the paid training.{" "}
        <span className="whitespace-nowrap font-medium text-ink">
          Entering stays free.
        </span>
      </p>

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-xl border border-red/25 bg-red/[0.06] px-3 py-2 text-center text-[14px] font-medium text-red"
        >
          {error}
        </p>
      )}

      {/* The CTA inverts with the theme: near black on the cream page, warm
          gold on the dark one. Either way it is the highest contrast object in
          view, which is the only property that actually matters here. */}
      <button
        type="submit"
        disabled={submitting}
        className="font-display mt-4 flex min-h-[56px] w-full items-center justify-center rounded-[var(--cta-radius)] bg-[linear-gradient(180deg,var(--cta-from),var(--cta-to))] text-[var(--cta-ink)] shadow-[inset_0_1px_0_var(--cta-lift),var(--cta-glow)] transition hover:brightness-110 active:translate-y-px px-6 text-[17px] font-bold tracking-[-0.01em] disabled:opacity-70"
      >
        {submitting ? (
          "Entering you now…"
        ) : (
          <>
            Enter for&nbsp;<span className="uppercase">free</span>
          </>
        )}
      </button>

      {/* The reassurance goes directly under the button, where the hesitation
          actually happens: this audience has been warned that people
          impersonate Mo to harvest details, so the sentence that matters is
          the one about what we will never ask for. */}
      <SecureNote className="mt-3.5" />

      <EntryCount className="mt-4" />

      {/* Consent sits with the button, not in a footer. This is the global
          baseline; the US, India and the Gulf each need a stricter variant
          resolved server-side from /api/geo before paid traffic runs. */}
      <p className="mt-4 text-center text-[11.5px] leading-[1.45] text-faint">
        By tapping the button you agree that {COMPANY} can contact you by phone,
        SMS and WhatsApp about this. Tell us to stop at any time and we will.{" "}
        <a href="/privacy" className="underline underline-offset-2 hover:text-muted">
          Privacy
        </a>{" "}
        &middot;{" "}
        <a href="/rules" className="underline underline-offset-2 hover:text-muted">
          Rules
        </a>
      </p>
    </form>
  );
}
