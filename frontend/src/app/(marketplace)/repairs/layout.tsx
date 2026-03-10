import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Riparim Orësh Luksoze — Servis & Restaurim në Shqipëri",
  description:
    "Gjej specialistët më të mirë për riparim dhe servis orësh luksoze në Shqipëri dhe Ballkan. Teknikë të certifikuar për Rolex, Omega, TAG Heuer dhe shumë marka të tjera.",
  keywords: [
    "riparim orësh Tiranë", "servis orësh Shqipëri", "riparim Rolex Tiranë",
    "watch repair Albania", "watch service Tirana", "orë servis Kosovë",
    "riparim orësh luksi", "luxury watch repair Albania",
    "servis satova Srbija", "popravak satova Balkan",
    "watch restoration Albania", "watchmaker Tirana",
  ],
  openGraph: {
    title: "Riparim Orësh Luksoze | TimeTrader Shqipëri",
    description: "Gjej specialistët më të mirë për riparim orësh luksoze në Shqipëri dhe Ballkan.",
    type: "website",
  },
  alternates: { canonical: "/repairs" },
};

export default function RepairsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
