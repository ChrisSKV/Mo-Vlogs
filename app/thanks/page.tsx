import type { Metadata } from "next";
import { ThanksScreen } from "@/components/thanks-screen";

export const metadata: Metadata = {
  title: "You’re in | The Build Challenge",
  description: "Keep your phone close. Someone from Mo’s team is calling you shortly.",
  // A post-conversion page has no business in search results.
  robots: { index: false, follow: false },
};

export default function ThanksPage() {
  return <ThanksScreen />;
}
