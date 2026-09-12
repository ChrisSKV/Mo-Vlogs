"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";
import * as Flags from "country-flag-icons/react/3x2";

export type PhoneValue = { e164: string; isValid: boolean; country: CountryCode };

type Country = { iso: CountryCode; name: string; dial: string };

const FLAGS = Flags as Record<string, React.ComponentType<{ className?: string }>>;

/**
 * Countries that open the list, in this order. Lifted from the hand-ordered
 * dial-code list on winwithmo.com, which is Mo's team's own audience model
 * written down: Gulf first, then the Levant and North Africa, then the West,
 * then South Asia. Their existing config also exempts +971 from every rate
 * limit. Everything not listed here still appears, alphabetically, below.
 */
const PRIORITY: CountryCode[] = [
  "AE", "SA", "QA", "KW", "BH", "OM",
  "EG", "JO", "LB", "IQ", "MA", "DZ", "TN",
  "GB", "US", "CA",
  "IN", "PK", "BD", "LK", "NP",
  "NG", "ZA", "KE",
];

/**
 * One geo lookup per page, shared by every instance. The page carries two
 * forms, so without this each visitor costs two identical requests — trivial
 * alone, wasteful across a video drop that puts thousands of people on the
 * page in an hour. Module-level, so it also survives a remount.
 */
let geoPromise: Promise<string | null> | null = null;
function detectCountry(): Promise<string | null> {
  if (!geoPromise) {
    geoPromise = fetch("/api/geo")
      .then((r) => r.json())
      .then((d) => (typeof d?.country === "string" ? d.country : null))
      .catch(() => null);
  }
  return geoPromise;
}

/** Real SVG flag: emoji flags do not render on Windows and render
 *  inconsistently in the older Android WebViews a lot of this traffic uses. */
function Flag({ iso }: { iso: string }) {
  const F = FLAGS[iso];
  return (
    <span className="inline-flex h-4 w-6 shrink-0 items-center justify-center overflow-hidden rounded-[3px] ring-1 ring-black/10">
      {F ? <F className="h-full w-full object-cover" /> : <span className="text-[7px] text-faint">{iso}</span>}
    </span>
  );
}

function buildCountries(): Country[] {
  const dn =
    typeof Intl !== "undefined" && "DisplayNames" in Intl
      ? new Intl.DisplayNames(["en"], { type: "region" })
      : null;
  const all = getCountries().map((iso) => ({
    iso,
    name: (dn?.of(iso) || iso) as string,
    dial: "+" + getCountryCallingCode(iso),
  }));
  const rank = new Map(PRIORITY.map((iso, i) => [iso, i]));
  return all.sort((a, b) => {
    const ra = rank.has(a.iso) ? rank.get(a.iso)! : Infinity;
    const rb = rank.has(b.iso) ? rank.get(b.iso)! : Infinity;
    if (ra !== rb) return ra - rb;
    return a.name.localeCompare(b.name, "en");
  });
}

/**
 * Phone field that can only emit a REAL number.
 *
 * A free-text tel input accepts "0755551234" or "00 1 555 1234" and the funnel
 * happily stores it, so the CRM takes it, the dial silently goes nowhere, and
 * the lead looks captured while being unreachable. This validates against the
 * picked country and hands back E.164, or says it is not valid.
 */
export default function PhoneInput({
  onChange,
  invalid,
  id = "phone",
  ariaDescribedby,
}: {
  onChange: (v: PhoneValue) => void;
  invalid?: boolean;
  id?: string;
  ariaDescribedby?: string;
}) {
  const countries = useMemo(buildCountries, []);
  // Defaults to UAE, not US: this is a Dubai offer and the Gulf is the
  // commercial core of the audience. Geo-detection overrides it below.
  const [country, setCountry] = useState<CountryCode>("AE");
  const [number, setNumber] = useState("");
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const [search, setSearch] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const current = countries.find((c) => c.iso === country);

  useEffect(() => {
    let active = true;
    detectCountry().then((iso) => {
      if (active && iso && countries.some((c) => c.iso === iso)) {
        setCountry(iso as CountryCode);
      }
    });
    return () => {
      active = false;
    };
  }, [countries]);

  useEffect(() => {
    const raw = `${current?.dial ?? ""}${number}`.replace(/[^\d+]/g, "");
    let e164 = raw;
    let isValid = false;
    if (number.trim().length > 0) {
      try {
        isValid = isValidPhoneNumber(raw, country);
        if (isValid) e164 = parsePhoneNumberFromString(raw, country)?.number ?? raw;
      } catch {
        isValid = false;
      }
    }
    onChangeRef.current({ e164, isValid, country });
  }, [country, number, current?.dial]);

  // Flip the list up when there is no room below, and close on outside click.
  useEffect(() => {
    if (!open) return;
    const rect = rootRef.current?.getBoundingClientRect();
    if (rect) {
      const below = window.innerHeight - rect.bottom;
      setDropUp(below < 280 && rect.top > below);
    }
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    const t = setTimeout(() => searchRef.current?.focus(), 60);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open]);

  const shown = search.trim()
    ? countries.filter((c) => {
        const q = search.trim().toLowerCase();
        return c.name.toLowerCase().includes(q) || c.dial.includes(q) || c.iso.toLowerCase() === q;
      })
    : countries;

  return (
    <div ref={rootRef} className="relative">
      <div
        className={`flex items-stretch overflow-hidden rounded-xl border bg-surface-2 transition focus-within:bg-white ${
          invalid ? "border-red" : "border-line-2 focus-within:border-gold"
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={`Country: ${current?.name ?? country}`}
          aria-expanded={open}
          className="flex shrink-0 items-center gap-1.5 border-r border-line-2 px-3 transition hover:bg-surface"
        >
          <Flag iso={country} />
          <span className="text-[13px] tabular-nums text-slate">{current?.dial}</span>
          <svg width="9" height="6" viewBox="0 0 9 6" aria-hidden="true" className="text-faint">
            <path d="M1 1l3.5 3.5L8 1" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </svg>
        </button>
        <input
          id={id}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          aria-invalid={invalid || undefined}
          aria-describedby={ariaDescribedby}
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="Phone number"
          /* 16px keeps iOS from zooming the page on focus — a zoom here pushes
             the button out of the fold the whole layout is budgeted around. */
          className="w-full bg-transparent px-4 py-3.5 text-[16px] text-ink placeholder:text-muted focus:outline-none"
        />
      </div>

      {open && (
        <div
          className={`absolute left-0 right-0 z-30 overflow-hidden rounded-xl border border-line bg-white shadow-lg ${
            dropUp ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          <div className="border-b border-line p-2">
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country"
              className="w-full rounded-lg bg-surface px-3 py-2 text-[16px] text-ink placeholder:text-muted focus:outline-none"
            />
          </div>
          <ul className="max-h-56 overflow-y-auto py-1">
            {shown.map((c) => (
              <li key={c.iso}>
                <button
                  type="button"
                  onClick={() => {
                    setCountry(c.iso);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13.5px] transition hover:bg-surface ${
                    c.iso === country ? "font-semibold text-gold-deep" : "text-ink"
                  }`}
                >
                  <Flag iso={c.iso} />
                  <span className="min-w-0 flex-1 truncate">{c.name}</span>
                  <span className="shrink-0 tabular-nums text-muted">{c.dial}</span>
                </button>
              </li>
            ))}
            {!shown.length && <li className="px-3 py-3 text-[13px] text-muted">No match.</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
