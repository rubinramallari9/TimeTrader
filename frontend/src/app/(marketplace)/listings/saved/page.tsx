"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ListingCard as ListingCardType } from "@/types";
import { listingsApi } from "@/lib/listings-api";
import { useAuthStore } from "@/store/auth";
import ListingCard from "@/components/listings/ListingCard";

export default function SavedListingsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [listings, setListings] = useState<ListingCardType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/login?from=/listings/saved"); return; }
    listingsApi.getSaved()
      .then(({ data }) => setListings(data.results))
      .finally(() => setLoading(false));
  }, [user, router]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Saved Watches</h1>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-100" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-5 bg-gray-100 rounded w-1/3 mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-gray-400 text-lg">No saved watches yet</p>
          <p className="text-gray-400 text-sm mt-1">Browse listings and tap the heart icon to save.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
        </div>
      )}
    </div>
  );
}
