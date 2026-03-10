import type { Metadata } from "next";

const API  = process.env.NEXT_PUBLIC_API_URL  ?? "http://localhost:8000/api/v1";
const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://timetrader.al";

interface StoreMeta {
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
    const res = await fetch(`${API}/stores/${slug}/`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error();
    const s: StoreMeta = await res.json();

    const location = [s.city, s.country].filter(Boolean).join(", ");
    const title    = `${s.name} — Dyqan Orësh${location ? ` në ${location}` : ""}`;
    const desc     = s.description
      ? `${s.description.slice(0, 150)}…`
      : `Zbulo koleksionin e ${s.name}, dyqan i certifikuar orësh luksoze${location ? ` në ${location}` : " në Shqipëri"}.`;

    return {
      title,
      description: desc,
      keywords: [
        `${s.name} orë`, `dyqan orësh ${s.city ?? "Shqipëri"}`,
        `${s.name} watches Albania`, `watch store ${s.city ?? "Albania"}`,
        "luxury watch store Albania", "dyqan orësh Tiranë",
      ],
      openGraph: {
        title,
        description: desc,
        type: "website",
        url: `${BASE}/stores/${slug}`,
        images: s.logo_url ? [{ url: s.logo_url, width: 400, height: 400, alt: s.name }] : [],
      },
      twitter: {
        card: "summary",
        title,
        description: desc,
        images: s.logo_url ? [s.logo_url] : [],
      },
      alternates: { canonical: `/stores/${slug}` },
    };
  } catch {
    return {
      title: "Dyqan Orësh | TimeTrader",
      description: "Dyqan i certifikuar orësh luksoze në TimeTrader Shqipëri.",
    };
  }
}

export default function StoreDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
