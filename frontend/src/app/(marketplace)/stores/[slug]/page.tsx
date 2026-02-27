"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { StoreDetail, Review, ListingCard as ListingCardType } from "@/types";
import { storesApi } from "@/lib/stores-api";
import { useAuthStore } from "@/store/auth";
import StarRating from "@/components/shared/StarRating";
import { VerifiedBadge } from "@/components/shared/Badge";
import ListingCard from "@/components/listings/ListingCard";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABELS: Record<string, string> = {
  mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday",
  fri: "Friday", sat: "Saturday", sun: "Sunday",
};

export default function StoreDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuthStore();

  const [store, setStore]               = useState<StoreDetail | null>(null);
  const [storeListings, setStoreListings] = useState<ListingCardType[]>([]);
  const [reviews, setReviews]           = useState<Review[]>([]);
  const [loading, setLoading]           = useState(true);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewContent, setReviewContent] = useState("");
  const [submitting, setSubmitting]     = useState(false);
  const [reviewError, setReviewError]   = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      storesApi.get(slug),
      storesApi.getListings(slug),
      storesApi.getReviews(slug),
    ])
      .then(([{ data: s }, { data: l }, { data: r }]) => {
        setStore(s);
        setStoreListings(l.results);
        setReviews(r.results);
      })
      .catch(() => router.push("/stores"))
      .finally(() => setLoading(false));
  }, [slug, router]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewRating) { setReviewError("Please select a rating."); return; }
    setSubmitting(true);
    setReviewError(null);
    try {
      const { data } = await storesApi.postReview(slug, { rating: reviewRating, content: reviewContent });
      setReviews((r) => [data, ...r]);
      setReviewRating(0);
      setReviewContent("");
    } catch {
      setReviewError("Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-10 animate-pulse space-y-4">
      <div className="h-36 bg-[#EDE9E3] rounded-2xl" />
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-64 bg-[#EDE9E3] rounded-2xl" />
        ))}
      </div>
    </div>
  );

  if (!store) return null;

  const isOwner = user?.id === store.owner.id;
  const hasHours = Object.values(store.opening_hours).some(Boolean);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[#9E9585] mb-6">
        <Link href="/stores" className="hover:text-[#B09145] transition-colors">Stores</Link>
        <span>/</span>
        <span className="text-[#0E1520]">{store.name}</span>
      </nav>

      {/* Store header */}
      <div className="bg-white border border-[#EDE9E3] rounded-2xl p-5 sm:p-7 mb-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-[#F0EDE8] flex-shrink-0 overflow-hidden">
            {store.logo_url ? (
              <Image src={store.logo_url} alt={store.name} width={80} height={80} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-[#C8C0B0]">
                {store.name[0]}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-2xl font-bold text-[#0E1520]">{store.name}</h1>
              {store.is_verified && <VerifiedBadge />}
              {store.is_featured && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#B09145]/10 text-[#B09145] border border-[#B09145]/20">
                  Featured
                </span>
              )}
            </div>
            <StarRating rating={store.average_rating} count={store.review_count} />
            {(store.city || store.country) && (
              <p className="text-sm text-[#9E9585] mt-1">
                {[store.city, store.country].filter(Boolean).join(", ")}
              </p>
            )}
          </div>

          {isOwner && (
            <Link
              href="/dashboard/store"
              className="flex-shrink-0 text-xs font-semibold border border-[#EDE9E3] px-4 py-2 rounded-lg text-[#9E9585] hover:border-[#B09145] hover:text-[#B09145] transition-colors"
            >
              Manage Store
            </Link>
          )}
        </div>

        {store.description && (
          <p className="text-sm text-[#9E9585] mt-5 leading-relaxed">{store.description}</p>
        )}

        {/* Contact row */}
        {(store.phone || store.email || store.website || store.address) && (
          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-5 pt-5 border-t border-[#EDE9E3]">
            {store.phone && (
              <a href={`tel:${store.phone}`} className="flex items-center gap-1.5 text-xs text-[#9E9585] hover:text-[#0E1520] transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                {store.phone}
              </a>
            )}
            {store.email && (
              <a href={`mailto:${store.email}`} className="flex items-center gap-1.5 text-xs text-[#9E9585] hover:text-[#0E1520] transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                {store.email}
              </a>
            )}
            {store.website && (
              <a href={store.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-[#B09145] hover:text-[#C8A96E] transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253" />
                </svg>
                Website
              </a>
            )}
            {store.address && (
              <span className="flex items-center gap-1.5 text-xs text-[#9E9585]">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {store.address}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Watches for sale ─────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="tt-section-label text-[#B09145] mb-1">Inventory</p>
            <h2 className="font-display italic text-3xl text-[#0E1520]">
              Watches for Sale
              {storeListings.length > 0 && (
                <span className="text-xl text-[#9E9585] ml-2">({storeListings.length})</span>
              )}
            </h2>
          </div>
          {isOwner && (
            <Link href="/sell" className="tt-btn-gold py-2 px-4 rounded-xl text-xs">
              + Add Watch
            </Link>
          )}
        </div>

        {storeListings.length === 0 ? (
          <div className="bg-white border border-[#EDE9E3] rounded-2xl py-16 px-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#F0EDE8] flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-[#C8C0B0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="font-semibold text-[#0E1520] mb-1">No watches listed yet</p>
            <p className="text-sm text-[#9E9585]">
              {isOwner ? "Add your first watch to start selling." : "This store hasn't listed any watches yet."}
            </p>
            {isOwner && (
              <Link href="/sell" className="tt-btn-gold py-2.5 px-6 rounded-xl text-sm inline-block mt-4">
                List a Watch
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {storeListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>

      {/* ── Opening hours ─────────────────────────────────── */}
      {hasHours && (
        <div className="bg-white border border-[#EDE9E3] rounded-2xl p-5 sm:p-6 mb-6">
          <h2 className="font-semibold text-[#0E1520] mb-4">Opening Hours</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DAYS.filter((d) => store.opening_hours[d]).map((d) => (
              <div key={d} className="flex justify-between text-sm py-1 border-b border-[#F0EDE8] last:border-0">
                <span className="text-[#9E9585]">{DAY_LABELS[d]}</span>
                <span className="font-medium text-[#0E1520]">{store.opening_hours[d]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Reviews ───────────────────────────────────────── */}
      <div className="bg-white border border-[#EDE9E3] rounded-2xl p-5 sm:p-6">
        <h2 className="font-semibold text-[#0E1520] mb-5">Reviews ({store.review_count})</h2>

        {user && !isOwner && (
          <form onSubmit={submitReview} className="border border-[#EDE9E3] rounded-xl p-4 mb-6 space-y-3">
            <p className="text-xs font-semibold tracking-[0.1em] uppercase text-[#9E9585]">Leave a review</p>
            {reviewError && <p className="text-xs text-red-500">{reviewError}</p>}
            <StarRating rating={reviewRating} interactive onChange={setReviewRating} />
            <textarea
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              rows={3}
              placeholder="Share your experience with this store..."
              className="w-full border border-[#EDE9E3] rounded-lg px-3 py-2 text-sm text-[#0E1520] placeholder-[#C8C0B0] focus:outline-none focus:ring-2 focus:ring-[#B09145] resize-none"
            />
            <button
              type="submit"
              disabled={submitting}
              className="tt-btn-gold py-2 px-5 rounded-lg text-xs disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit review"}
            </button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="text-sm text-[#9E9585]">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="border-b border-[#F0EDE8] pb-4 last:border-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-semibold text-sm text-[#0E1520]">{r.author.full_name || r.author.username}</span>
                  <StarRating rating={r.rating} />
                  <span className="text-xs text-[#9E9585]">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                {r.content && <p className="text-sm text-[#9E9585]">{r.content}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
