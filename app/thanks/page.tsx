import type { Metadata } from "next";
import { Footer } from "@/components/landing";
import { ThanksScreen } from "@/components/thanks-screen";

const TITLE = "You’re in | The Build Challenge";
const DESCRIPTION =
  "Keep your phone close. Someone from Mo’s team is calling you shortly.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  // A post-conversion page has no business in search results.
  robots: { index: false, follow: false },
  // Page metadata does not inherit into openGraph or twitter, and the root
  // layout writes the prize figure into both. People do share "I just
  // entered", and that preview must not quote an amount the live test hides.
  openGraph: { title: TITLE, description: DESCRIPTION },
  twitter: { title: TITLE, description: DESCRIPTION },
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
