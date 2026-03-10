import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orë Luksi për Shitje — Rolex, Patek Philippe & Më Shumë",
  description:
    "Shfleto qindra orë luksi të certifikuara në Shqipëri dhe Ballkan. Gjej Rolex, Patek Philippe, Audemars Piguet, Omega dhe shumë të tjera. Çmime konkurruese, shitës të verifikuar.",
  keywords: [
    "orë luksi Shqipëri", "blerje orësh online", "Rolex shitje Tirana",
    "orë Patek Philippe Shqipëri", "Audemars Piguet Ballkan",
    "orë dore të dyta Shqipëri", "second hand watches Albania",
    "luxury watches for sale Albania", "pre-owned Rolex Albania",
    "satovi prodaja Balkan", "luksuzni satovi kupovina",
  ],
  openGraph: {
    title: "Orë Luksi për Shitje | TimeTrader Shqipëri",
    description: "Shfleto qindra orë luksi të certifikuara në Shqipëri dhe Ballkan.",
    type: "website",
  },
  alternates: { canonical: "/listings" },
};

export default function ListingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
