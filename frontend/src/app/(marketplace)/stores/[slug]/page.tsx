"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { StoreDetail, Review } from "@/types";
import { storesApi } from "@/lib/stores-api";
import { useAuthStore } from "@/store/auth";
import StarRating from "@/components/shared/StarRating";
import { VerifiedBadge } from "@/components/shared/Badge";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABELS: Record<string, string> = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" };

export default function StoreDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const [store, setStore] = useState<StoreDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewContent, setReviewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([storesApi.get(slug), storesApi.getReviews(slug)])
      .then(([{ data: s }, { data: r }]) => { setStore(s); setReviews(r.results); })
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
    <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse space-y-6">
      <div className="h-8 bg-gray-100 rounded w-1/3" />
      <div className="h-40 bg-gray-100 rounded-2xl" />
    </div>
  );

  if (!store) return null;

  const isOwner = user?.id === store.owner.id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <nav className="text-sm text-gray-400 mb-6 flex gap-2">
        <Link href="/stores" className="hover:text-gray-700">Stores</Link>
        <span>/</span>
        <span className="text-gray-600">{store.name}</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gray-100 flex-shrink-0 overflow-hidden">
            {store.logo_url ? (
              <Image src={store.logo_url} alt={store.name} width={80} height={80} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-300">{store.name[0]}</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
              {store.is_verified && <VerifiedBadge />}
              {store.is_featured && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Featured</span>}
            </div>
            <StarRating rating={store.average_rating} count={store.review_count} />
            <p className="text-sm text-gray-500 mt-1">{[store.city, store.country].filter(Boolean).join(", ")}</p>
          </div>
          {isOwner && (
            <Link href={`/dashboard/store`} className="text-sm border border-gray-200 px-4 py-2 rounded-lg hover:border-gray-900 transition-colors">
              Edit Store
            </Link>
          )}
        </div>

        {store.description && <p className="text-sm text-gray-600 mt-4 leading-relaxed">{store.description}</p>}

        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
          {store.phone && <span>📞 {store.phone}</span>}
          {store.email && <span>✉️ {store.email}</span>}
          {store.website && <a href={store.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">🌐 Website</a>}
          {store.address && <span>📍 {store.address}</span>}
        </div>
      </div>

      {/* Opening hours */}
      {Object.keys(store.opening_hours).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Opening Hours</h2>
          <div className="grid grid-cols-2 gap-2">
            {DAYS.filter((d) => store.opening_hours[d]).map((d) => (
              <div key={d} className="flex justify-between text-sm">
                <span className="text-gray-500">{DAY_LABELS[d]}</span>
                <span className="font-medium text-gray-900">{store.opening_hours[d]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Reviews ({store.review_count})</h2>

        {user && !isOwner && (
          <form onSubmit={submitReview} className="border border-gray-100 rounded-xl p-4 mb-6 space-y-3">
            <p className="text-sm font-medium text-gray-700">Leave a review</p>
            {reviewError && <p className="text-xs text-red-600">{reviewError}</p>}
            <StarRating rating={reviewRating} interactive onChange={setReviewRating} />
            <textarea
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              rows={3}
              placeholder="Share your experience..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
            />
            <button type="submit" disabled={submitting} className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors">
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="text-sm text-gray-400">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="border-b border-gray-50 pb-4 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-gray-900">{r.author.full_name || r.author.username}</span>
                  <StarRating rating={r.rating} />
                  <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                {r.content && <p className="text-sm text-gray-600">{r.content}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
