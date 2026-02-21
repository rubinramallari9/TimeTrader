"use client";

import { useState, useEffect, useCallback } from "react";
import { StoreCard } from "@/types";
import { storesApi } from "@/lib/stores-api";
import DirectoryCard from "@/components/shared/DirectoryCard";

export default function StoresPage() {
  const [stores, setStores] = useState<StoreCard[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");

  const fetchStores = useCallback(async (q: { search?: string; city?: string }) => {
    setLoading(true);
    try {
      const { data } = await storesApi.list(q);
      setStores(data.results);
      setTotal(data.count);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStores({}); }, [fetchStores]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStores({ search: search || undefined, city: city || undefined });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Watch Stores</h1>
        <p className="text-gray-500 mb-6">{total.toLocaleString()} stores worldwide</p>

        <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl flex-wrap">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stores..."
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
      ) : stores.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-gray-400 text-lg">No stores found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store) => (
            <DirectoryCard
              key={store.id}
              href={`/stores/${store.slug}`}
              name={store.name}
              logo_url={store.logo_url}
              city={store.city}
              country={store.country}
              is_verified={store.is_verified}
              is_featured={store.is_featured}
              average_rating={store.average_rating}
              review_count={store.review_count}
            />
          ))}
        </div>
      )}
    </div>
  );
}
