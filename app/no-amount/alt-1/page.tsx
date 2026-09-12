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

export const metadata: Metadata = {
  title: "The Build Challenge | Mo Vlogs",
  description:
    "You have the idea. AI builds it for you. Free to enter, and Mo invests his own money in one business from this group.",
  robots: { index: false, follow: false },
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
