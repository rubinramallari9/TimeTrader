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

const BRANDS = [
  "Rolex",
  "Patek Philippe",
  "Audemars Piguet",
  "Omega",
  "Cartier",
  "IWC",
  "Breitling",
  "TAG Heuer",
  "Vacheron Constantin",
  "A. Lange & Söhne",
];

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

  const handleBrandPill = (brand: string) => {
    const isActive = filters.brand === brand;
    setFilters((f) => ({ ...f, brand: isActive ? undefined : brand, page: 1 }));
  };

  return (
    <>
      {/* Hero section */}
      <div className="bg-[#0E1520] border-b border-[#1E2D40]">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <p className="tt-section-label text-[#B09145] mb-3">The World&apos;s Finest</p>
          <h1 className="tt-hero-headline text-white text-4xl sm:text-5xl mb-2">
            Discover Exceptional Timepieces
          </h1>
          <p className="text-[#9E9585] text-sm mt-2 mb-8">
            {total > 0 ? `${total.toLocaleString()} watches from verified sellers worldwide` : "Browse from verified sellers worldwide"}
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-2xl mb-8">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search brand, model, reference number..."
              className="flex-1 bg-[#161E2E] border border-[#1E2D40] rounded-xl px-5 py-3.5 text-sm text-white placeholder-[#4A5568] focus:outline-none focus:ring-2 focus:ring-[#B09145] focus:border-transparent transition-shadow"
            />
            <button
              type="submit"
              className="tt-btn-gold text-xs py-3 px-6 rounded-xl"
            >
              Search
            </button>
          </form>

          {/* Brand pills */}
          <div className="flex gap-2 flex-wrap">
            {BRANDS.map((brand) => (
              <button
                key={brand}
                onClick={() => handleBrandPill(brand)}
                className={`text-[10px] font-semibold tracking-[0.12em] uppercase px-3 py-1.5 rounded-full border transition-all duration-200 ${
                  filters.brand === brand
                    ? "bg-[#B09145] border-[#B09145] text-white"
                    : "border-[#2A3A50] text-[#9E9585] hover:border-[#B09145] hover:text-[#B09145]"
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Listings grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
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
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden text-xs font-semibold tracking-widest uppercase text-[#9E9585] border border-[#EDE9E3] px-3 py-1.5 rounded-lg hover:border-[#B09145] hover:text-[#B09145] transition-colors"
              >
                {showFilters ? "Hide" : "Filters"}
              </button>
              <p className="text-xs text-[#9E9585] hidden lg:block">
                {total.toLocaleString()} results
              </p>
              <select
                value={filters.sort ?? "-created_at"}
                onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
                className="text-xs font-semibold border border-[#EDE9E3] rounded-lg px-3 py-1.5 bg-white text-[#0E1520] focus:outline-none focus:ring-2 focus:ring-[#B09145] cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Mobile filter panel */}
            {showFilters && (
              <div className="lg:hidden bg-white border border-[#EDE9E3] rounded-xl p-5 mb-5">
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
                  <div key={i} className="bg-white rounded-2xl border border-[#EDE9E3] overflow-hidden animate-pulse">
                    <div className="aspect-square bg-[#F0EDE8]" />
                    <div className="p-4 space-y-2">
                      <div className="h-2.5 bg-[#EDE9E3] rounded w-1/3" />
                      <div className="h-4 bg-[#EDE9E3] rounded w-3/4" />
                      <div className="h-2.5 bg-[#EDE9E3] rounded w-1/2" />
                      <div className="h-5 bg-[#EDE9E3] rounded w-1/3 mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-24">
                <p className="font-display italic text-2xl text-[#9E9585] mb-2">No timepieces found</p>
                <p className="text-sm text-[#9E9585]">Try adjusting your filters or search terms</p>
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
    </>
  );
}
