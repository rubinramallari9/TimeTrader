import type { Metadata } from "next";

const API  = process.env.NEXT_PUBLIC_API_URL  ?? "http://localhost:8000/api/v1";
const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://timetrader.al";

interface ListingMeta {
  id: string;
  title?: string;
  brand: string;
  model: string;
  price: string;
  currency: string;
  condition: string;
  location_city?: string;
  location_country?: string;
  primary_image?: { url: string } | null;
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API}/listings/${id}/`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error();
    const l: ListingMeta = await res.json();

    const city    = l.location_city    ? ` në ${l.location_city}` : " në Shqipëri";
    const title   = `${l.brand} ${l.model} — ${l.price} ${l.currency}`;
    const desc    = `Bli ${l.brand} ${l.model} (${l.condition})${city}. Shitës i verifikuar, orë e autentike dhe e certifikuar në TimeTrader.`;
    const image   = l.primary_image?.url;

    return {
      title,
      description: desc,
      keywords: [
        `${l.brand} ${l.model} shitje`, `${l.brand} Shqipëri`,
        `${l.brand} ${l.model} Albania`, `buy ${l.brand} Albania`,
        `orë ${l.brand} Tiranë`, `${l.brand} for sale Albania`,
        "luxury watch Albania", "orë luksi Shqipëri",
      ],
      openGraph: {
        title,
        description: desc,
        type: "website",
        url: `${BASE}/listings/${id}`,
        images: image ? [{ url: image, width: 800, height: 800, alt: `${l.brand} ${l.model}` }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description: desc,
        images: image ? [image] : [],
      },
      alternates: { canonical: `/listings/${id}` },
    };
  } catch {
    return {
      title: "Listing | TimeTrader",
      description: "Shfleto orën luksoze në TimeTrader — tregu kryesor i orëve në Shqipëri.",
    };
  }
}

export default function ListingDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
