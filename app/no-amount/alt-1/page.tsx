import type { Metadata } from "next";
import {
  ClosingCTA,
  FirstPlace,
  Footer,
  Prize,
  TopBar,
} from "@/components/landing";
import { HeroDark } from "@/components/hero-dark";
import { OptinModalProvider } from "@/components/optin-modal";
import { OpenOptin } from "@/components/open-optin";

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

/** The dark variant with the figure withheld. See /no-amount for why. */
export default function NoAmountAltPage() {
  return (
    <div className="theme-dark min-h-screen">
      <OptinModalProvider>
        <TopBar />
        <main>
          <HeroDark showAmount={false} />
          <FirstPlace showAmount={false} />
          <Prize />
          <ClosingCTA cta={<OpenOptin />} />
        </main>
        <Footer />
      </OptinModalProvider>
    </div>
  );
}
