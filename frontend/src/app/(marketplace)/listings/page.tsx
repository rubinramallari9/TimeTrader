"use client";

import { useState, useEffect, useCallback } from "react";
import { ListingCard as ListingCardType, ListingFilters } from "@/types";
import { listingsApi } from "@/lib/listings-api";
import ListingCard from "@/components/listings/ListingCard";
import FilterSidebar from "@/components/listings/FilterSidebar";

const SORT_OPTIONS = [
  { value: "-created_at", label: "Newest first" },
  { value: "price", label: "Price: Low to high" },
  { value: "-price", label: "Price: High to low" },
  { value: "-views_count", label: "Most viewed" },
];

const EMPTY_FILTERS: ListingFilters = {};

export default function ListingsPage() {
  const [listings, setListings] = useState<ListingCardType[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ListingFilters>({ sort: "-created_at" });
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchListings = useCallback(async (f: ListingFilters) => {
    setLoading(true);
    try {
      const { data } = await listingsApi.list(f);
      setListings(data.results);
      setTotal(data.count);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings(filters);
  }, [filters, fetchListings]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, search: search || undefined, page: 1 }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero search */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Watches</h1>
        <p className="text-gray-500 mb-6">Discover {total.toLocaleString()} watches from verified sellers worldwide</p>

        <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brand, model, reference..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
          />
          <button
            type="submit"
            className="bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      <div className="flex gap-8">
        {/* Filter sidebar — desktop */}
        <div className="hidden lg:block w-56 flex-shrink-0">
          <FilterSidebar
            filters={filters}
            onChange={(f) => setFilters({ ...f, page: 1 })}
            onClear={() => setFilters({ sort: filters.sort })}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg"
            >
              Filters
            </button>
            <p className="text-sm text-gray-500 hidden lg:block">{total.toLocaleString()} results</p>
            <select
              value={filters.sort ?? "-created_at"}
              onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Mobile filter panel */}
          {showFilters && (
            <div className="lg:hidden bg-white border border-gray-100 rounded-xl p-4 mb-4">
              <FilterSidebar
                filters={filters}
                onChange={(f) => setFilters({ ...f, page: 1 })}
                onClear={() => setFilters({ sort: filters.sort })}
              />
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-100" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-5 bg-gray-100 rounded w-1/3 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No listings found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
