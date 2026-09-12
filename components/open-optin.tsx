"use client";

import { useOptinModal } from "@/components/optin-modal";

/**
 * The variant's only call to action.
 *
 * Its own client component so the dark page can stay a server component: the
 * hero is an image and a headline, and none of it needs to ship as JavaScript
 * just because one button opens a dialog.
 */
export function OpenOptin() {
  const { open } = useOptinModal();
  return (
    <button
      type="button"
      onClick={open}
      className="cta-sweep font-display relative flex min-h-[62px] w-full max-w-[400px] items-center justify-center overflow-hidden rounded-[var(--cta-radius)] bg-[linear-gradient(180deg,var(--cta-from),var(--cta-to))] px-8 text-[17px] font-bold uppercase tracking-[0.02em] text-[var(--cta-ink)] shadow-[inset_0_1px_0_var(--cta-lift),var(--cta-glow)] transition hover:brightness-110 active:translate-y-px"
    >
      Enter for free
    </button>
  );
}
