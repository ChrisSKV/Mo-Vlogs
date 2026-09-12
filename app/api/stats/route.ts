import { NextResponse } from "next/server";
import { countLeads } from "@/lib/db";
import { ENTRY_COUNT_FLOOR } from "@/lib/tokens";

/**
 * How many people have actually entered.
 *
 * A real COUNT, not a number that drifts on a timer. This creator carries a
 * 1.16M-view video accusing him of misleading his audience, so a counter that
 * someone could catch moving on its own is a liability, not social proof.
 *
 * Below ENTRY_COUNT_FLOOR it reports `show: false` and the component renders
 * nothing: an honest "31 people have entered" in the first hour is worse than
 * no counter at all, and inventing a bigger one is the thing we are avoiding.
 */
export const dynamic = "force-dynamic";

let cache: { at: number; n: number } | null = null;
const TTL_MS = 30_000;

export async function GET() {
  let n = cache && Date.now() - cache.at < TTL_MS ? cache.n : null;

  if (n === null) {
    try {
      n = await countLeads();
      cache = { at: Date.now(), n };
    } catch {
      // A dead database must not take the section down with it.
      n = cache?.n ?? 0;
    }
  }

  return NextResponse.json(
    { entries: n, show: n >= ENTRY_COUNT_FLOOR },
    { headers: { "cache-control": "public, max-age=30" } },
  );
}
