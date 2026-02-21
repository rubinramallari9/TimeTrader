"use client";

import { useState, useEffect, useCallback } from "react";
import { RepairShopCard } from "@/types";
import { repairsApi } from "@/lib/repairs-api";
import DirectoryCard from "@/components/shared/DirectoryCard";

export default function RepairsPage() {
  const [shops, setShops] = useState<RepairShopCard[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");

  const fetchShops = useCallback(async (q: { search?: string; city?: string }) => {
    setLoading(true);
    try {
      const { data } = await repairsApi.list(q);
      setShops(data.results);
      setTotal(data.count);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchShops({}); }, [fetchShops]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchShops({ search: search || undefined, city: city || undefined });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Watch Repair Shops</h1>
        <p className="text-gray-500 mb-6">{total.toLocaleString()} repair shops worldwide</p>

        <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl flex-wrap">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search repair shops..."
            className="flex-1 min-w-40 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
          />
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            className="w-36 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
          />
          <button type="submit" className="bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="flex gap-4 mb-4">
                <div className="w-14 h-14 bg-gray-100 rounded-xl" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-gray-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : shops.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-gray-400 text-lg">No repair shops found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shops.map((shop) => (
            <DirectoryCard
              key={shop.id}
              href={`/repairs/${shop.slug}`}
              name={shop.name}
              logo_url={shop.logo_url}
              city={shop.city}
              country={shop.country}
              is_verified={shop.is_verified}
              is_featured={shop.is_featured}
              average_rating={shop.average_rating}
              review_count={shop.review_count}
              meta={`${shop.service_count} service${shop.service_count !== 1 ? "s" : ""}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
