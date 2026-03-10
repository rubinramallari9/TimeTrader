import type { Metadata } from "next";

const API  = process.env.NEXT_PUBLIC_API_URL  ?? "http://localhost:8000/api/v1";
const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://timetrader.al";

interface RepairMeta {
  name: string;
  city?: string;
  country?: string;
  description?: string;
  logo_url?: string | null;
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(`${API}/repairs/${slug}/`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error();
    const r: RepairMeta = await res.json();

    const location = [r.city, r.country].filter(Boolean).join(", ");
    const title    = `${r.name} — Riparim Orësh${location ? ` në ${location}` : ""}`;
    const desc     = r.description
      ? `${r.description.slice(0, 150)}…`
      : `Servis dhe riparim orësh luksoze nga ${r.name}${location ? ` në ${location}` : " në Shqipëri"}. Teknikë të certifikuar.`;

    return {
      title,
      description: desc,
      keywords: [
        `riparim orësh ${r.city ?? "Shqipëri"}`, `${r.name} servis orësh`,
        `watch repair ${r.city ?? "Albania"}`, `${r.name} watch service`,
        "riparim orësh Tiranë", "watch repair Albania",
        "luxury watch service Albania", "servis orësh Shqipëri",
      ],
      openGraph: {
        title,
        description: desc,
        type: "website",
        url: `${BASE}/repairs/${slug}`,
        images: r.logo_url ? [{ url: r.logo_url, width: 400, height: 400, alt: r.name }] : [],
      },
      twitter: {
        card: "summary",
        title,
        description: desc,
        images: r.logo_url ? [r.logo_url] : [],
      },
      alternates: { canonical: `/repairs/${slug}` },
    };
  } catch {
    return {
      title: "Riparim Orësh | TimeTrader",
      description: "Servis dhe riparim orësh luksoze në TimeTrader Shqipëri.",
    };
  }
}

export default function RepairDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
