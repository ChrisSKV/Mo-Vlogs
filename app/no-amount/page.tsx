import type { Metadata } from "next";
import { Landing } from "@/components/landing";

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
 * The control, with the figure withheld.
 *
 * Management asked to see the offer without a number on it for now, so this
 * cut names the investment and who is writing the cheque but not how much.
 * It is the same components as `/` with one flag turned off rather than a
 * copy of them, so the approved page stays the single source of the layout
 * and the two cannot drift apart while the amount is still being decided.
 */
export default function NoAmountPage() {
  return <Landing showAmount={false} />;
}
