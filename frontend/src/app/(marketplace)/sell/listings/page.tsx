"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MyListing, ListingStatus } from "@/types";
import { listingsApi } from "@/lib/listings-api";
import { useAuthStore } from "@/store/auth";
import { ConditionBadge } from "@/components/shared/Badge";

const STATUS_TABS: { value: ListingStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "sold", label: "Sold" },
  { value: "pending", label: "Pending" },
  { value: "removed", label: "Removed" },
];

const STATUS_BADGE: Record<ListingStatus, string> = {
  active: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  sold: "bg-blue-50 text-blue-700 border border-blue-200",
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  removed: "bg-[#F0EDE8] text-[#9E9585] border border-[#EDE9E3]",
};

export default function MyListingsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [listings, setListings] = useState<MyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ListingStatus | "all">("all");
  const [deleteTarget, setDeleteTarget] = useState<MyListing | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { router.push("/login?from=/sell/listings"); return; }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const load = async (status?: ListingStatus | "all") => {
    setLoading(true);
    try {
      const { data } = await listingsApi.mine(status && status !== "all" ? status : undefined);
      setListings(data.results);
    } finally {
      setLoading(false);
    }
  };

  const handleTab = (tab: ListingStatus | "all") => {
    setActiveTab(tab);
    load(tab);
  };

  const handleMarkSold = async (id: string) => {
    if (markingId) return;
    setMarkingId(id);
    try {
      await listingsApi.markAsSold(id);
      setListings((prev) => prev.map((l) => l.id === id ? { ...l, status: "sold" } : l));
    } finally {
      setMarkingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await listingsApi.remove(deleteTarget.id);
      setListings((prev) => prev.map((l) => l.id === deleteTarget.id ? { ...l, status: "removed" } : l));
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const stats = {
    total: listings.length,
    active: listings.filter((l) => l.status === "active").length,
    sold: listings.filter((l) => l.status === "sold").length,
    views: listings.reduce((sum, l) => sum + l.views_count, 0),
  };

  const displayed = activeTab === "all"
    ? listings
    : listings.filter((l) => l.status === activeTab);

  const formatPrice = (price: string, currency: string) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD", maximumFractionDigits: 0 }).format(Number(price));

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0E1520]">My Listings</h1>
          <p className="text-sm text-[#9E9585] mt-0.5">Manage your watch listings</p>
        </div>
        <Link href="/sell" className="tt-btn-gold py-2.5 px-5 rounded-xl text-sm">
          + List New Watch
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Total Listed", value: stats.total },
          { label: "Active", value: stats.active },
          { label: "Sold", value: stats.sold },
          { label: "Total Views", value: stats.views.toLocaleString() },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-[#EDE9E3] rounded-2xl px-5 py-4">
            <p className="text-2xl font-bold text-[#0E1520]">{s.value}</p>
            <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#9E9585] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[#F0EDE8] rounded-xl p-1 w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTab(tab.value)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === tab.value
                ? "bg-white text-[#0E1520] shadow-sm"
                : "text-[#9E9585] hover:text-[#0E1520]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Listings */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#EDE9E3] rounded-2xl h-24 animate-pulse" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="bg-white border border-[#EDE9E3] rounded-2xl px-8 py-16 text-center">
          <p className="text-[#9E9585] text-sm mb-4">
            {activeTab === "all" ? "You have no listings yet." : `No ${activeTab} listings.`}
          </p>
          <Link href="/sell" className="tt-btn-gold py-2.5 px-6 rounded-xl text-sm inline-block">
            List Your First Watch
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((listing) => (
            <div
              key={listing.id}
              className="bg-white border border-[#EDE9E3] rounded-2xl flex items-center gap-4 p-3 sm:p-4"
            >
              {/* Thumbnail */}
              <Link href={`/listings/${listing.id}`} className="flex-shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#F0EDE8]">
                  {listing.primary_image ? (
                    <Image
                      src={listing.primary_image.url}
                      alt={listing.title}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-[#C8C0B0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[listing.status]}`}>
                    {listing.status}
                  </span>
                  {listing.is_featured && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#B09145]/10 text-[#B09145] border border-[#B09145]/20">
                      Promoted
                    </span>
                  )}
                  <ConditionBadge condition={listing.condition} />
                </div>
                <p className="font-semibold text-[#0E1520] text-sm truncate">{listing.title}</p>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  <span className="text-sm font-bold text-[#0E1520]">
                    {formatPrice(listing.price, listing.currency)}
                  </span>
                  <span className="text-[11px] text-[#9E9585] flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {listing.views_count} views
                  </span>
                  <span className="text-[11px] text-[#9E9585] hidden sm:block">
                    Listed {formatDate(listing.created_at)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {listing.status === "active" && (
                  <>
                    <Link
                      href={`/sell/edit/${listing.id}`}
                      className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#9E9585] hover:text-[#0E1520] border border-[#EDE9E3] rounded-lg px-3 py-1.5 transition-colors"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/sell/promote/${listing.id}`}
                      className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#B09145] hover:text-[#C8A96E] border border-[#B09145]/30 rounded-lg px-3 py-1.5 transition-colors"
                    >
                      {listing.is_featured ? "Promoted" : "Promote"}
                    </Link>
                    <button
                      onClick={() => handleMarkSold(listing.id)}
                      disabled={markingId === listing.id}
                      className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                    >
                      {markingId === listing.id ? "..." : "Mark Sold"}
                    </button>
                  </>
                )}

                {/* Mobile: compact action menu */}
                <div className="sm:hidden flex gap-1.5">
                  {listing.status === "active" && (
                    <>
                      <Link href={`/sell/edit/${listing.id}`} className="p-2 rounded-lg border border-[#EDE9E3] text-[#9E9585]">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleMarkSold(listing.id)}
                        disabled={markingId === listing.id}
                        className="p-2 rounded-lg border border-blue-200 text-blue-600 disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>

                {listing.status !== "removed" && (
                  <button
                    onClick={() => setDeleteTarget(listing)}
                    className="p-2 rounded-lg border border-[#EDE9E3] text-[#C8C0B0] hover:text-red-500 hover:border-red-200 transition-colors"
                    aria-label="Delete listing"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-[#0E1520] mb-1">Remove listing?</h2>
            <p className="text-sm text-[#9E9585] mb-5">
              <span className="font-medium text-[#0E1520]">{deleteTarget.title}</span> will be removed from the marketplace. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 tt-btn-outline py-2.5 rounded-xl text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
              >
                {deleting ? "Removing…" : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
