import type { Metadata } from "next";
import { FirstPlace, Footer, TopBar } from "@/components/landing";
import { HeroDark } from "@/components/hero-dark";
import { OptinModalProvider } from "@/components/optin-modal";

const AMOUNT = "$10,000";

const TITLE = "The Build Challenge | Mo Vlogs";
const DESCRIPTION = `You have the idea. AI builds it for you. Free to enter, and Mo invests ${AMOUNT} of his own money in the best business from this group.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  // Page metadata does not inherit into openGraph or twitter, so the figure
  // has to be restated here or the WhatsApp preview falls back to the layout.
  openGraph: { title: TITLE, description: DESCRIPTION },
  twitter: { title: TITLE, description: DESCRIPTION },
};

/**
 * The live page. Management settled on $10,000, so the committed offer that
 * used to sit at /10k is now the site itself and the other cuts are gone.
 *
 * The approved dark page with the figure swapped in, and nothing below the
 * prize panel. The rest of the prize ladder (the Dubai final, the camera
 * crew, the gallery) and the closing reminder are left out: hero, the money,
 * footer.
 *
 * `stake={null}` on purpose. The 10% on the approved cut was a working
 * assumption that went with $50,000, and nobody has agreed an equity figure
 * against $10,000, so the panel states the investment and not the terms.
 */
export default function Page() {
  return (
    <div className="theme-dark min-h-screen">
      <OptinModalProvider>
        <TopBar />
        <main>
          <HeroDark amount={AMOUNT} subtitle="learn" />
          <FirstPlace amount={AMOUNT} stake={null} />
        </main>
        <Footer />
      </OptinModalProvider>
    </div>
  );
}
