import Link from "next/link";

/**
 * Shared chrome for /rules and /privacy.
 *
 * These two pages are not a formality. The existing movlogscircle.com 404s on
 * both while collecting name, email and phone and sending SMS — that gap is
 * costing them trust as well as compliance. Here, the rules page is what turns
 * a possible unlicensed lottery into a lawful skill contest, and publishing it
 * well is a trust asset rather than a liability.
 */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto max-w-[46rem] px-5 pb-24 pt-10 md:px-8">
      <Link
        href="/"
        className="inline-block text-[13.5px] text-muted underline underline-offset-4 hover:text-ink"
      >
        &larr; Back
      </Link>
      <h1 className="font-display mt-6 text-[34px] font-bold md:text-[42px] leading-[1.1] tracking-[-0.035em] text-ink">
        {title}
      </h1>
      <p className="mt-2 text-[13px] text-muted">Last updated {updated}</p>
      <div className="mt-9 space-y-8 text-[16px] leading-[1.7] text-slate">{children}</div>
    </main>
  );
}

export function Clause({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display flex gap-3 text-[18px] font-bold leading-snug tracking-[-0.02em] text-ink">
        <span className="shrink-0 tabular-nums text-gold-deep">{n}</span>
        <span>{title}</span>
      </h2>
      <div className="mt-2 space-y-3 pl-[calc(1ch+0.75rem)]">{children}</div>
    </section>
  );
}

/** Anything the client must fill in before this page can go live. */
export function Todo({ children }: { children: React.ReactNode }) {
  return (
    <mark className="rounded bg-gold-soft px-1.5 py-0.5 font-medium text-gold-deep">{children}</mark>
  );
}
