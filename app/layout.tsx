import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import "./globals.css";

/* Inter for text: the same typeface as the live movlogscircle.com, so the two
   pages read as one brand. Self-hosted through next/font, so no external
   request and automatic fallback-metric matching — the headline block cannot
   reflow the form out of the fold on a slow connection.

   Inter Tight for display. Inter at headline size is wide and a little inert;
   Tight closes the counters and lets a three-line headline hold the top of the
   page without eating the vertical budget the form needs. */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"), // PLACEHOLDER: real domain
  title: "The Build Challenge | Mo Vlogs",
  description:
    "You have the idea. AI builds it. Free training, free to enter, and Mo invests his own money in one business from this group.",
  // Indexed on purpose. Scammers have impersonated Mo to harvest personal
  // details and his fans were warned about it, so being findable and
  // verifiable is a trust asset here — an unindexed page cannot be checked.
  robots: { index: true, follow: true },
  openGraph: {
    title: "The Build Challenge | Mo Vlogs",
    description:
      "You have the idea. AI builds it for you. Free to enter, and Mo invests $50,000 of his own money in one business from this group.",
    type: "website",
    siteName: "The Build Challenge",
    // TODO before launch: restore the share card. This link lives in a YouTube
    // description and gets forwarded on WhatsApp, so for a large share of the
    // audience the preview IS the first impression. Held back only because the
    // prize figure on it is still a placeholder.
  },
  twitter: {
    card: "summary_large_image",
    title: "The Build Challenge | Mo Vlogs",
    description:
      "You have the idea. AI builds it for you. Free to enter, and Mo invests $50,000 of his own money in one business from this group.",
  },
};

export const viewport: Viewport = {
  themeColor: "#030303",
  width: "device-width",
  initialScale: 1,
  // No maximum-scale: pinch-zoom is how people with low vision read a phone,
  // and locking it out to protect a layout is never the right trade.
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${interTight.variable}`}>
      <body className={`${inter.className} grain`}>{children}</body>
    </html>
  );
}
