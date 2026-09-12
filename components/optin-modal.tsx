"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import OptinForm from "@/components/optin-form";

/**
 * The opt-in as a dialog, for the dark variant.
 *
 * The control puts the form beside the promise; here the promise owns the
 * screen and the form arrives on demand. That is a real trade, not a style
 * choice: it buys a much stronger first frame and costs a tap, so the two
 * variants are measuring whether this audience needs the form in front of
 * them or is sold before they look for it.
 */

const Ctx = createContext<{ open: () => void }>({ open: () => {} });

export function useOptinModal() {
  return useContext(Ctx);
}

export function OptinModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  return (
    <Ctx.Provider value={{ open }}>
      {children}
      {isOpen && <Modal onClose={() => setIsOpen(false)} />}
    </Ctx.Provider>
  );
}

function Modal({ onClose }: { onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus moves INTO the dialog on open: with aria-modal set and focus left
  // outside, a screen reader stays on a now-hidden element and the dialog is
  // never announced. The panel takes focus rather than the first field, so the
  // mobile keyboard does not spring up unasked. Focus returns on close.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    return () => opener?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const els = panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        );
        if (!els.length) return;
        const first = els[0];
        const last = els[els.length - 1];
        const active = document.activeElement;
        const inside = panelRef.current.contains(active);
        if (e.shiftKey && (active === first || !inside)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (active === last || !inside)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);

    // iOS Safari ignores overflow:hidden on body for touch scrolling, so the
    // page is pinned in place and the scroll position restored on close.
    const scrollY = window.scrollY;
    const b = document.body.style;
    b.position = "fixed";
    b.top = `-${scrollY}px`;
    b.left = "0";
    b.right = "0";
    b.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      b.position = "";
      b.top = "";
      b.left = "";
      b.right = "";
      b.overflow = "";
      const html = document.documentElement;
      const prev = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto";
      window.scrollTo(0, scrollY);
      html.style.scrollBehavior = prev;
    };
  }, [onClose]);

  return (
    // No items-center: a panel taller than the viewport (landscape phone, open
    // keyboard, 200% zoom) has to scroll from the top. my-auto centres it
    // whenever there is room.
    <div
      className="fixed inset-0 z-[100] flex justify-center overflow-y-auto overscroll-contain p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="optin-modal-title"
    >
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm [touch-action:none]"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative my-auto w-full max-w-[430px] rounded-3xl border border-line bg-white px-5 pb-6 pt-7 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.9)] focus:outline-none sm:px-7"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3.5 top-3.5 flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition hover:border-line-2 hover:text-ink"
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <h2 id="optin-modal-title" className="sr-only">
          Enter the Build Challenge
        </h2>

        <OptinForm variant="hero" />
      </div>
    </div>
  );
}
