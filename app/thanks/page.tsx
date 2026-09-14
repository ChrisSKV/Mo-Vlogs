import type { Metadata } from "next";
import { Footer } from "@/components/landing";
import { ThanksScreen } from "@/components/thanks-screen";

export const metadata: Metadata = {
  title: "You’re in | The Build Challenge",
  description:
    "Keep your phone close. Someone from Mo’s team is calling you shortly.",
  // A post-conversion page has no business in search results.
  robots: { index: false, follow: false },
};

/**
 * The form sends ?v=dark when it was submitted from a dark page, so the
 * confirmation continues the screen the visitor was just looking at. Read on
 * the server rather than from storage after mount, which would render the
 * light theme first and then snap to dark.
 */
export default async function ThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ v?: string }>;
}) {
  const { v } = await searchParams;
  const dark = v === "dark";

  const page = (
    <>
      <ThanksScreen dark={dark} />
      <Footer />
    </>
  );

  return dark ? <div className="theme-dark min-h-screen">{page}</div> : page;
}
