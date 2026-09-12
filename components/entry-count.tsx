"use client";

import { useEffect, useState } from "react";
import { CLOSE_AT, OPEN_AT } from "@/lib/tokens";

/**
 * Entries so far, and how much of the window is left.
 *
 * The same shape as the seat counter on the Alex Mineo opt-in, with the
 * direction reversed: that one starts at 678 of 1000 and decays on a timer,
 * which works there because seats on a webinar really are finite.
 *
 * Here they are not. Entry is free, uncapped, and the rules page says so in
 * as many words, so "X places left" would be a claim the page contradicts one
 * click away. The bar therefore tracks the entry window closing, which is a
 * real deadline, and the number counts entries received, which is a real
 * count. Same urgency, nothing to catch us on.
 */
export function EntryCount({ className = "" }: { className?: string }) {
  const [entries, setEntries] = useState<number | null>(null);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let alive = true;

    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => {
        if (alive && d?.show) setEntries(d.entries);
      })
      .catch(() => {});

    const open = new Date(OPEN_AT).getTime();
    const close = new Date(CLOSE_AT).getTime();
    const now = Date.now();
    setPct(Math.max(2, Math.min(100, ((now - open) / (close - open)) * 100)));

    return () => {
      alive = false;
    };
  }, []);

  // Nothing to say yet: no bar, no placeholder, no reserved gap.
  if (entries === null) return null;

  return (
    <div className={className}>
      <div className="h-[5px] overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-gold-top),var(--color-gold))] transition-[width] duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-center text-[12.5px] text-muted">
        <b className="font-semibold tabular-nums text-ink">
          {entries.toLocaleString("en-US")}
        </b>{" "}
        {entries === 1 ? "person has" : "people have"} entered so far
      </p>
    </div>
  );
}
