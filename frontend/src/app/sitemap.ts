import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://timetrader.al";
const API  = process.env.NEXT_PUBLIC_API_URL  ?? "http://localhost:8000/api/v1";

async function fetchSlugs(path: string, key: string): Promise<string[]> {
  try {
    const res = await fetch(`${API}${path}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json();
    const items: { [k: string]: string }[] = json.results ?? json;
    return items.map((i) => i[key]).filter(Boolean);
  } catch {
    return [];
  }
}

async function fetchListingIds(): Promise<string[]> {
  try {
    const res = await fetch(`${API}/listings/?page_size=500`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.results ?? []).map((l: { id: string }) => l.id);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [listingIds, storeSlugs, repairSlugs] = await Promise.all([
    fetchListingIds(),
    fetchSlugs("/stores/?page_size=500", "slug"),
    fetchSlugs("/repairs/?page_size=500", "slug"),
  ]);

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,            lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE}/listings`, lastModified: now, changeFrequency: "hourly",  priority: 0.9 },
    { url: `${BASE}/stores`,   lastModified: now, changeFrequency: "daily",   priority: 0.8 },
    { url: `${BASE}/repairs`,  lastModified: now, changeFrequency: "daily",   priority: 0.8 },
  ];

  const listingRoutes: MetadataRoute.Sitemap = listingIds.map((id) => ({
    url: `${BASE}/listings/${id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const storeRoutes: MetadataRoute.Sitemap = storeSlugs.map((slug) => ({
    url: `${BASE}/stores/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const repairRoutes: MetadataRoute.Sitemap = repairSlugs.map((slug) => ({
    url: `${BASE}/repairs/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...listingRoutes, ...storeRoutes, ...repairRoutes];
}
