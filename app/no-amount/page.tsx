import type { Metadata } from "next";
import { Footer, Hero, TopBar } from "@/components/landing";

const DESCRIPTION =
  "You have the idea. AI builds it for you. Free to enter, and Mo invests his own money in one business from this group.";

export const metadata: Metadata = {
  title: "The Build Challenge | Mo Vlogs",
  description: DESCRIPTION,
  robots: { index: false, follow: false },
  // The root layout hardcodes the figure into the share card copy, and page
  // metadata does not inherit into openGraph or twitter: without these two the
  // link preview on WhatsApp would still quote the amount, which is the one
  // place it must not appear.
  openGraph: {
    title: "The Build Challenge | Mo Vlogs",
    description: DESCRIPTION,
  },
  twitter: {
    title: "The Build Challenge | Mo Vlogs",
    description: DESCRIPTION,
  },
};

/**
 * The control, cut down to a test.
 *
 * Management want to test the waters before settling on an amount, and asked
 * for it to stay vague: no figure, no flights, no set terms. So this is the
 * hero and the footer and nothing else. The prize ladder and the first place
 * panel are exactly the parts that commit to specifics (the Dubai final, the
 * equity stake), so rather than softening them they are left out.
 *
 * Same Hero component as `/` with the figure switched off, so the approved
 * page is still the single source of the layout.
 */
export default function NoAmountPage() {
  return (
    <>
      <TopBar />
      <main>
        <Hero showAmount={false} />
      </main>
      <Footer />
    </>
  );
}
