import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/auth/AuthProvider";
import { MarketplaceJsonLd, OrganizationJsonLd } from "@/components/shared/JsonLd";

const SITE_NAME = "TimeTrader";
const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? "https://timetrader.al";
const SITE_DESC =
  "Blej dhe shit orë luksi në Shqipëri dhe Ballkan. Tregu kryesor për orë dore të certifikuara — Rolex, Patek Philippe, Audemars Piguet dhe shumë të tjera. Buy & sell luxury watches in Albania and the Balkans.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: `${SITE_NAME} — Tregu i Orëve Luksoze në Shqipëri`,
    template: `%s | ${SITE_NAME}`,
  },

  description: SITE_DESC,

  keywords: [
    // Albanian
    "orë luksi Shqipëri", "orë dore të dyta", "shitblerje orësh", "treg orësh Tiranë",
    "orë Rolex Shqipëri", "orë Patek Philippe", "orë luksi Tirana",
    "blerje orësh online", "shitje orësh online Shqipëri",
    // Balkan
    "luksuzni satovi Balkan", "satovi Srbija", "satovi Hrvatska",
    "luksuzni sat Beograd", "satovi Bosna", "satovi Makedonija", "satovi Kosovo",
    "Rolex Srbija", "Patek Philippe Hrvatska", "sat Crna Gora",
    // English geo
    "luxury watch marketplace Albania", "buy sell watches Albania",
    "pre-owned watches Balkans", "certified watches Tirana",
    "watch authentication Albania", "luxury watches Balkans",
    "second hand watches Albania", "Rolex Albania",
  ],

  authors: [{ name: "TimeTrader", url: SITE_URL }],
  creator: "TimeTrader",
  publisher: "TimeTrader",

  alternates: {
    canonical: SITE_URL,
    languages: {
      "sq":    SITE_URL,
      "sq-AL": SITE_URL,
      "sr":    `${SITE_URL}/sr`,
      "hr":    `${SITE_URL}/hr`,
      "en":    `${SITE_URL}/en`,
    },
  },

  openGraph: {
    type: "website",
    locale: "sq_AL",
    alternateLocale: ["en_US", "sr_RS", "hr_HR"],
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Tregu i Orëve Luksoze në Shqipëri & Ballkan`,
    description: SITE_DESC,
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "TimeTrader — Luxury Watch Marketplace Albania",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Tregu i Orëve Luksoze në Shqipëri`,
    description: SITE_DESC,
    images: [`${SITE_URL}/og-image.jpg`],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "",
  },

  category: "marketplace",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sq">
      <body className="antialiased">
        <MarketplaceJsonLd />
        <OrganizationJsonLd />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
