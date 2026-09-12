"use client";

import { useEffect, useState } from "react";
import { CLOSE_AT } from "@/lib/tokens";

/**
 * Counts down to one fixed moment, CLOSE_AT.
 *
 * It counts to a real published date rather than a rolling window, so it reads
 * the same on every device and does not reset when someone reloads. That is the
 * whole difference between a deadline and a dark pattern, and for this audience
 * it matters: a timer that restarts is the fastest way to get screenshotted onto
 * a reaction channel.
 *
 * Renders placeholder digits on the server and swaps to live ones after mount,
 * so there is no hydration mismatch and no empty box before JS lands.
 */
function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

/** The digits are cells for sighted readers; the screen reader gets a sentence,
 *  and a sentence that says "1 hours" is a sentence nobody proofread. */
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

type Variant = "hero" | "bar" | "light";

export function Countdown({
  variant = "hero",
  className = "",
}: {
  variant?: Variant;
  className?: string;
}) {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const target = new Date(CLOSE_AT).getTime();
    const tick = () => setLeft(target - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const closed = left !== null && left <= 0;
  const { d, h, m, s } = parts(left ?? 0);
  const pending = left === null;

  if (closed) {
    return (
      <p
        className={`text-[13px] font-medium ${
          variant === "hero" ? "text-ink" : "text-[#f5f2ea]/80"
        } ${className}`}
      >
        Entries for Season 1 are closed.
      </p>
    );
  }

  const cells = [
    { v: pending ? "00" : String(d), l: "days" },
    { v: pending ? "00" : pad(h), l: "hrs" },
    { v: pending ? "00" : pad(m), l: "min" },
    { v: pending ? "00" : pad(s), l: "sec", hideOnSmall: true },
  ];

  return (
    <div className={className}>
      <div
        className={variant === "bar" ? "flex gap-1" : "flex gap-2"}
        role="timer"
        aria-live="off"
        aria-hidden={pending}
      >
        {cells.map((c) => (
          <Cell key={c.l} value={c.v} label={c.l} variant={variant} hideOnSmall={c.hideOnSmall} />
        ))}
      </div>
      {!pending && (
        <p className="sr-only">
          {plural(d, "day")}, {plural(h, "hour")} and {plural(m, "minute")} left
          to enter.
        </p>
      )}
    </div>
  );
}

function Cell({
  value,
  label,
  variant,
  hideOnSmall,
}: {
  value: string;
  label: string;
  variant: Variant;
  hideOnSmall?: boolean;
}) {
  if (variant === "bar") {
    return (
      <span
        className={`flex min-w-[36px] flex-col items-center rounded-md bg-[#f7f5f0] px-1.5 py-1 leading-none ${
          hideOnSmall ? "hidden sm:flex" : ""
        }`}
      >
        <span className="font-display text-[13.5px] font-bold tabular-nums text-[#17140d]">
          {value}
        </span>
        <span className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.1em] text-[#7b7466]">
          {label}
        </span>
      </span>
    );
  }

  // Pinned to literal white: this cell is used on panels that are dark in BOTH
  // themes, where the white token resolves to the dark card colour.
  if (variant === "light") {
    return (
      <span className="flex min-w-[60px] flex-col items-center rounded-xl bg-[#f7f5f0] px-2.5 py-2.5 shadow-[0_12px_26px_-14px_rgba(0,0,0,0.85)]">
        <span className="font-display text-[22px] font-bold leading-none tabular-nums text-[#17140d]">
          {value}
        </span>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#7b7466]">
          {label}
        </span>
      </span>
    );
  }

  return (
    <span className="flex min-w-[52px] flex-col items-center rounded-xl border border-line bg-white px-2 py-2 shadow-sm">
      <span className="font-display text-[20px] font-bold leading-none tabular-nums text-ink">
        {value}
      </span>
      <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.1em] text-muted">
        {label}
      </span>
    </span>
  );
}
