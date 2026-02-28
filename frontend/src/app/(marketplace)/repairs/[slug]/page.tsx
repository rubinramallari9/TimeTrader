"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { RepairShopDetail, RepairShowcase, Review } from "@/types";
import { repairsApi } from "@/lib/repairs-api";
import { useAuthStore } from "@/store/auth";
import StarRating from "@/components/shared/StarRating";
import { VerifiedBadge } from "@/components/shared/Badge";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABELS: Record<string, string> = {
  mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday",
  fri: "Friday", sat: "Saturday", sun: "Sunday",
};

export default function RepairShopDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuthStore();

  const [shop, setShop]             = useState<RepairShopDetail | null>(null);
  const [reviews, setReviews]       = useState<Review[]>([]);
  const [showcase, setShowcase]     = useState<RepairShowcase[]>([]);
  const [loading, setLoading]       = useState(true);

  // Review form
  const [reviewRating, setReviewRating]     = useState(0);
  const [reviewContent, setReviewContent]   = useState("");
  const [reviewError, setReviewError]       = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Appointment form
  const [selectedService, setSelectedService] = useState("");
  const [scheduledAt, setScheduledAt]         = useState("");
  const [apptNotes, setApptNotes]             = useState("");
  const [apptSuccess, setApptSuccess]         = useState(false);
  const [apptError, setApptError]             = useState<string | null>(null);
  const [submittingAppt, setSubmittingAppt]   = useState(false);

  useEffect(() => {
    Promise.all([
      repairsApi.get(slug),
      repairsApi.getReviews(slug),
      repairsApi.getShowcase(slug),
    ])
      .then(([{ data: s }, { data: r }, { data: sc }]) => {
        setShop(s);
        setReviews(r.results);
        setShowcase(sc);
      })
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
    <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse space-y-4">
      <div className="h-8 bg-[#EDE9E3] rounded w-1/3" />
      <div className="h-44 bg-[#EDE9E3] rounded-2xl" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-64 bg-[#EDE9E3] rounded-2xl" />
        <div className="h-64 bg-[#EDE9E3] rounded-2xl" />
      </div>
    </div>
  );

  if (!shop) return null;

  const isOwner = user?.id === shop.owner.id;
  const hasHours = Object.values(shop.opening_hours).some(Boolean);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[#9E9585] mb-6">
        <Link href="/repairs" className="hover:text-[#B09145] transition-colors">Repairs</Link>
        <span>/</span>
        <span className="text-[#0E1520]">{shop.name}</span>
      </nav>

      {/* Header card */}
      <div className="bg-white border border-[#EDE9E3] rounded-2xl p-5 sm:p-7 mb-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-[#F0EDE8] flex-shrink-0 overflow-hidden">
            {shop.logo_url ? (
              <Image src={shop.logo_url} alt={shop.name} width={80} height={80} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-[#C8C0B0]">
                {shop.name[0]}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-2xl font-bold text-[#0E1520]">{shop.name}</h1>
              {shop.is_verified && <VerifiedBadge />}
              {shop.is_featured && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#B09145]/10 text-[#B09145] border border-[#B09145]/20">
                  Featured
                </span>
              )}
            </div>
            <StarRating rating={shop.average_rating} count={shop.review_count} />
            {(shop.city || shop.country) && (
              <p className="text-sm text-[#9E9585] mt-1">
                {[shop.city, shop.country].filter(Boolean).join(", ")}
              </p>
            )}
          </div>

          {isOwner && (
            <Link
              href="/dashboard/repairs"
              className="flex-shrink-0 text-xs font-semibold border border-[#EDE9E3] px-4 py-2 rounded-lg text-[#9E9585] hover:border-[#B09145] hover:text-[#B09145] transition-colors"
            >
              Manage Shop
            </Link>
          )}
        </div>

        {shop.description && (
          <p className="text-sm text-[#9E9585] mt-5 leading-relaxed">{shop.description}</p>
        )}

        {/* Contact row */}
        {(shop.phone || shop.email || shop.address) && (
          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-5 pt-5 border-t border-[#EDE9E3]">
            {shop.phone && (
              <a href={`tel:${shop.phone}`} className="flex items-center gap-1.5 text-xs text-[#9E9585] hover:text-[#0E1520] transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                {shop.phone}
              </a>
            )}
            {shop.email && (
              <a href={`mailto:${shop.email}`} className="flex items-center gap-1.5 text-xs text-[#9E9585] hover:text-[#0E1520] transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                {shop.email}
              </a>
            )}
            {shop.address && (
              <span className="flex items-center gap-1.5 text-xs text-[#9E9585]">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {shop.address}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Services + Book appointment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Services */}
        {shop.services.length > 0 && (
          <div className="bg-white border border-[#EDE9E3] rounded-2xl p-5 sm:p-6">
            <h2 className="font-semibold text-[#0E1520] mb-4">Services</h2>
            <div className="space-y-3">
              {shop.services.map((s) => (
                <div key={s.id} className="border-b border-[#F0EDE8] pb-3 last:border-0">
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#0E1520]">{s.name}</p>
                      {s.description && <p className="text-xs text-[#9E9585] mt-0.5">{s.description}</p>}
                      {s.duration_days && <p className="text-xs text-[#9E9585] mt-0.5">~{s.duration_days} day{s.duration_days !== 1 ? "s" : ""}</p>}
                    </div>
                    {(s.price_from || s.price_to) && (
                      <span className="text-sm font-semibold text-[#B09145] whitespace-nowrap flex-shrink-0">
                        {s.price_from && s.price_to
                          ? `$${s.price_from}–$${s.price_to}`
                          : s.price_from
                          ? `From $${s.price_from}`
                          : `Up to $${s.price_to}`}
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
          <div className="bg-white border border-[#EDE9E3] rounded-2xl p-5 sm:p-6">
            <h2 className="font-semibold text-[#0E1520] mb-4">Book Appointment</h2>
            {apptSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-4 text-sm">
                Request sent! The shop will confirm shortly.
                <button onClick={() => setApptSuccess(false)} className="block mt-2 underline text-xs">
                  Book another
                </button>
              </div>
            ) : (
              <form onSubmit={bookAppointment} className="space-y-3">
                {apptError && <p className="text-xs text-red-500">{apptError}</p>}
                {shop.services.length > 0 && (
                  <div>
                    <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-[#9E9585] mb-1.5">Service (optional)</label>
                    <select
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      className="w-full border border-[#EDE9E3] rounded-lg px-3 py-2.5 text-sm text-[#0E1520] bg-white focus:outline-none focus:ring-2 focus:ring-[#B09145]"
                    >
                      <option value="">— Any service —</option>
                      {shop.services.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-[#9E9585] mb-1.5">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full border border-[#EDE9E3] rounded-lg px-3 py-2.5 text-sm text-[#0E1520] focus:outline-none focus:ring-2 focus:ring-[#B09145] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-[#9E9585] mb-1.5">Notes</label>
                  <textarea
                    value={apptNotes}
                    onChange={(e) => setApptNotes(e.target.value)}
                    rows={3}
                    placeholder="Describe your watch and what needs to be done..."
                    className="w-full border border-[#EDE9E3] rounded-lg px-3 py-2 text-sm text-[#0E1520] placeholder-[#C8C0B0] focus:outline-none focus:ring-2 focus:ring-[#B09145] resize-none bg-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingAppt}
                  className="tt-btn-gold w-full py-2.5 rounded-xl text-sm disabled:opacity-50"
                >
                  {submittingAppt ? "Booking…" : "Request Appointment"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* ── Showcase ─────────────────────────────────────────── */}
      {showcase.length > 0 && (
        <div className="mb-6">
          <div className="mb-5">
            <p className="tt-section-label text-[#B09145] mb-1">Portfolio</p>
            <h2 className="font-display italic text-3xl text-[#0E1520]">Our Work</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {showcase.map((item) => (
              <div key={item.id} className="bg-white border border-[#EDE9E3] rounded-2xl overflow-hidden">
                <div className="grid grid-cols-2">
                  <div className="relative aspect-square">
                    <Image src={item.before_image_url} alt={`Before — ${item.title}`} fill className="object-cover" />
                    <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider bg-black/50 text-white px-1.5 py-0.5 rounded">Before</span>
                  </div>
                  <div className="relative aspect-square bg-[#F0EDE8] flex items-center justify-center">
                    {item.after_image_url ? (
                      <>
                        <Image src={item.after_image_url} alt={`After — ${item.title}`} fill className="object-cover" />
                        <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider bg-[#B09145]/80 text-white px-1.5 py-0.5 rounded">After</span>
                      </>
                    ) : (
                      <span className="text-xs text-[#C8C0B0]">No after</span>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-semibold text-sm text-[#0E1520]">{item.title}</p>
                  {(item.watch_brand || item.watch_model) && (
                    <p className="text-xs text-[#B09145] mt-0.5">{[item.watch_brand, item.watch_model].filter(Boolean).join(" ")}</p>
                  )}
                  {item.description && (
                    <p className="text-xs text-[#9E9585] mt-1 line-clamp-2">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Opening hours ─────────────────────────────────────── */}
      {hasHours && (
        <div className="bg-white border border-[#EDE9E3] rounded-2xl p-5 sm:p-6 mb-6">
          <h2 className="font-semibold text-[#0E1520] mb-4">Opening Hours</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DAYS.filter((d) => shop.opening_hours[d]).map((d) => (
              <div key={d} className="flex justify-between text-sm py-1 border-b border-[#F0EDE8] last:border-0">
                <span className="text-[#9E9585]">{DAY_LABELS[d]}</span>
                <span className="font-medium text-[#0E1520]">{shop.opening_hours[d]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Reviews ───────────────────────────────────────────── */}
      <div className="bg-white border border-[#EDE9E3] rounded-2xl p-5 sm:p-6">
        <h2 className="font-semibold text-[#0E1520] mb-5">Reviews ({shop.review_count})</h2>

        {user && !isOwner && (
          <form onSubmit={submitReview} className="border border-[#EDE9E3] rounded-xl p-4 mb-6 space-y-3">
            <p className="text-xs font-semibold tracking-[0.1em] uppercase text-[#9E9585]">Leave a review</p>
            {reviewError && <p className="text-xs text-red-500">{reviewError}</p>}
            <StarRating rating={reviewRating} interactive onChange={setReviewRating} />
            <textarea
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              rows={3}
              placeholder="Share your experience with this shop..."
              className="w-full border border-[#EDE9E3] rounded-lg px-3 py-2 text-sm text-[#0E1520] placeholder-[#C8C0B0] focus:outline-none focus:ring-2 focus:ring-[#B09145] resize-none bg-white"
            />
            <button
              type="submit"
              disabled={submittingReview}
              className="tt-btn-gold py-2 px-5 rounded-lg text-xs disabled:opacity-50"
            >
              {submittingReview ? "Submitting…" : "Submit review"}
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
