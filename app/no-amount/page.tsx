import type { Metadata } from "next";
import { Landing } from "@/components/landing";

export const metadata: Metadata = {
  title: "The Build Challenge | Mo Vlogs",
  description:
    "You have the idea. AI builds it for you. Free to enter, and Mo invests his own money in one business from this group.",
  // A variant must never compete with the control in search.
  robots: { index: false, follow: false },
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
