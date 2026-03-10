import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dyqane Orësh Luksoze në Shqipëri & Ballkan",
  description:
    "Zbulo dyqanet e certifikuara të orëve luksoze në Shqipëri, Kosovë dhe Ballkan. Çdo dyqan është i verifikuar nga TimeTrader për autenticitet dhe besueshmëri.",
  keywords: [
    "dyqan orësh Tiranë", "dyqan orësh Shqipëri", "dyqan orësh Kosovë",
    "watch store Albania", "watch shop Tirana", "luxury watch dealer Albania",
    "orë luksi dyqan Ballkan", "prodavnica satova Balkan",
    "watch boutique Albania", "certified watch dealer Balkans",
  ],
  openGraph: {
    title: "Dyqane Orësh Luksoze | TimeTrader Shqipëri",
    description: "Zbulo dyqanet e certifikuara të orëve luksoze në Shqipëri dhe Ballkan.",
    type: "website",
  },
  alternates: { canonical: "/stores" },
};

export default function StoresLayout({ children }: { children: React.ReactNode }) {
  return children;
}
