"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { RepairShopDetail, Review } from "@/types";
import { repairsApi } from "@/lib/repairs-api";
import { useAuthStore } from "@/store/auth";
import StarRating from "@/components/shared/StarRating";
import { VerifiedBadge } from "@/components/shared/Badge";

export default function RepairShopDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const [shop, setShop] = useState<RepairShopDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Review form
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewContent, setReviewContent] = useState("");
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Appointment form
  const [selectedService, setSelectedService] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [apptNotes, setApptNotes] = useState("");
  const [apptSuccess, setApptSuccess] = useState(false);
  const [apptError, setApptError] = useState<string | null>(null);
  const [submittingAppt, setSubmittingAppt] = useState(false);

  useEffect(() => {
    Promise.all([repairsApi.get(slug), repairsApi.getReviews(slug)])
      .then(([{ data: s }, { data: r }]) => { setShop(s); setReviews(r.results); })
      .catch(() => router.push("/repairs"))
      .finally(() => setLoading(false));
  }, [slug, router]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewRating) { setReviewError("Please select a rating."); return; }
    setSubmittingReview(true); setReviewError(null);
    try {
      const { data } = await repairsApi.postReview(slug, { rating: reviewRating, content: reviewContent });
      setReviews((r) => [data, ...r]);
      setReviewRating(0); setReviewContent("");
    } catch { setReviewError("Failed to submit review."); }
    finally { setSubmittingReview(false); }
  };

  const bookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledAt) { setApptError("Please select a date and time."); return; }
    setSubmittingAppt(true); setApptError(null); setApptSuccess(false);
    try {
      await repairsApi.bookAppointment(slug, {
        service: selectedService || undefined,
        scheduled_at: scheduledAt,
        notes: apptNotes,
      });
      setApptSuccess(true);
      setSelectedService(""); setScheduledAt(""); setApptNotes("");
    } catch { setApptError("Failed to book appointment."); }
    finally { setSubmittingAppt(false); }
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse space-y-6">
      <div className="h-8 bg-gray-100 rounded w-1/3" />
      <div className="h-40 bg-gray-100 rounded-2xl" />
    </div>
  );

  if (!shop) return null;

  const isOwner = user?.id === shop.owner.id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <nav className="text-sm text-gray-400 mb-6 flex gap-2">
        <Link href="/repairs" className="hover:text-gray-700">Repairs</Link>
        <span>/</span>
        <span className="text-gray-600">{shop.name}</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gray-100 flex-shrink-0 overflow-hidden">
            {shop.logo_url ? (
              <Image src={shop.logo_url} alt={shop.name} width={80} height={80} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-300">{shop.name[0]}</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{shop.name}</h1>
              {shop.is_verified && <VerifiedBadge />}
              {shop.is_featured && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Featured</span>}
            </div>
            <StarRating rating={shop.average_rating} count={shop.review_count} />
            <p className="text-sm text-gray-500 mt-1">{[shop.city, shop.country].filter(Boolean).join(", ")}</p>
          </div>
        </div>
        {shop.description && <p className="text-sm text-gray-600 mt-4 leading-relaxed">{shop.description}</p>}
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
          {shop.phone && <span>📞 {shop.phone}</span>}
          {shop.email && <span>✉️ {shop.email}</span>}
          {shop.address && <span>📍 {shop.address}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Services */}
        {shop.services.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Services</h2>
            <div className="space-y-3">
              {shop.services.map((s) => (
                <div key={s.id} className="border-b border-gray-50 pb-3 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{s.name}</p>
                      {s.description && <p className="text-xs text-gray-400 mt-0.5">{s.description}</p>}
                      {s.duration_days && <p className="text-xs text-gray-400">~{s.duration_days} days</p>}
                    </div>
                    {(s.price_from || s.price_to) && (
                      <span className="text-sm font-semibold text-gray-900 whitespace-nowrap ml-4">
                        {s.price_from && `$${s.price_from}`}{s.price_from && s.price_to && " – "}{s.price_to && `$${s.price_to}`}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Book appointment */}
        {user && !isOwner && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Book Appointment</h2>
            {apptSuccess ? (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 text-sm">
                Appointment request sent! The shop will confirm shortly.
                <button onClick={() => setApptSuccess(false)} className="block mt-2 underline text-xs">Book another</button>
              </div>
            ) : (
              <form onSubmit={bookAppointment} className="space-y-3">
                {apptError && <p className="text-xs text-red-600">{apptError}</p>}
                {shop.services.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service (optional)</label>
                    <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900">
                      <option value="">— Any service —</option>
                      {shop.services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                  <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    min={new Date().toISOString().slice(0, 16)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea value={apptNotes} onChange={(e) => setApptNotes(e.target.value)} rows={3}
                    placeholder="Describe your watch and what needs to be done..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none" />
                </div>
                <button type="submit" disabled={submittingAppt}
                  className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors">
                  {submittingAppt ? "Booking..." : "Request Appointment"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Reviews */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Reviews ({shop.review_count})</h2>
        {user && !isOwner && (
          <form onSubmit={submitReview} className="border border-gray-100 rounded-xl p-4 mb-6 space-y-3">
            <p className="text-sm font-medium text-gray-700">Leave a review</p>
            {reviewError && <p className="text-xs text-red-600">{reviewError}</p>}
            <StarRating rating={reviewRating} interactive onChange={setReviewRating} />
            <textarea value={reviewContent} onChange={(e) => setReviewContent(e.target.value)} rows={3}
              placeholder="Share your experience..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none" />
            <button type="submit" disabled={submittingReview}
              className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors">
              {submittingReview ? "Submitting..." : "Submit"}
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
