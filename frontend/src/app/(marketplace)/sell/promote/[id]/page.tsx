"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { listingsApi } from "@/lib/listings-api";
import { useAuthStore } from "@/store/auth";
import { ListingDetail, ListingPromotion, PROMOTION_PLANS, PromotionPlan } from "@/types";

const CHECK = (
  <svg className="w-4 h-4 text-[#B09145] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export default function PromotePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [promotion, setPromotion] = useState<ListingPromotion | null>(null);
  const [selected, setSelected] = useState<PromotionPlan>("featured");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) { router.push("/login?from=/sell"); return; }

    Promise.all([
      listingsApi.get(id),
      listingsApi.getPromotion(id),
    ]).then(([listingRes, promoRes]) => {
      setListing(listingRes.data);
      setPromotion(promoRes.data);
      if (promoRes.data?.plan) setSelected(promoRes.data.plan);
    }).catch(() => router.push("/sell"))
      .finally(() => setLoading(false));
  }, [id, isInitialized, user, router]);

  const handleActivate = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const { data } = await listingsApi.promote(id, selected);
      setPromotion(data);
      setSuccess(true);
    } catch {
      setError("Failed to activate promotion. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isInitialized || loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 animate-pulse space-y-4">
        <div className="h-6 bg-[#EDE9E3] rounded w-1/3" />
        <div className="h-4 bg-[#EDE9E3] rounded w-1/2" />
        <div className="grid grid-cols-3 gap-4 mt-8">
          {[0, 1, 2].map((i) => <div key={i} className="h-64 bg-[#EDE9E3] rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!listing) return null;

  // Already has active promotion
  if (success || (promotion && promotion.is_active && !promotion.is_expired)) {
    const activePlan = PROMOTION_PLANS.find((p) => p.key === (promotion?.plan ?? selected))!;
    const expiresAt = promotion
      ? new Date(promotion.expires_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
      : null;

    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-[#B09145]/10 border border-[#B09145]/30 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-[#B09145]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#0E1520] mb-2">Promotion Active</h1>
        <p className="text-[#9E9585] mb-1">
          <span className="font-semibold text-[#0E1520]">{listing.brand} {listing.model}</span> is now on the <span className="text-[#B09145] font-semibold">{activePlan.label}</span> plan.
        </p>
        {expiresAt && <p className="text-sm text-[#9E9585] mb-8">Active until {expiresAt}</p>}
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href={`/listings/${listing.id}`} className="tt-btn-gold py-2.5 px-6 rounded-xl text-sm">
            View Listing
          </Link>
          <Link href="/sell" className="tt-btn-outline py-2.5 px-6 rounded-xl text-sm">
            List Another Watch
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <nav className="text-xs text-[#9E9585] mb-4 flex gap-2 items-center">
          <Link href="/sell" className="hover:text-[#B09145] transition-colors">Sell</Link>
          <span>/</span>
          <span>Promote Listing</span>
        </nav>
        <h1 className="text-2xl font-bold text-[#0E1520] mb-1">Advertise Your Watch</h1>
        <p className="text-sm text-[#9E9585]">
          Boost visibility for <span className="font-medium text-[#0E1520]">{listing.brand} {listing.model}</span> and reach more buyers.
        </p>
      </div>

      {/* Beta banner */}
      <div className="bg-[#B09145]/10 border border-[#B09145]/30 rounded-xl px-4 py-3 flex items-center gap-3 mb-8">
        <svg className="w-4 h-4 text-[#B09145] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <p className="text-xs text-[#B09145] font-medium">
          Promotions are <strong>free during beta</strong>. Pricing shown is for reference only.
        </p>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {PROMOTION_PLANS.map((plan) => {
          const isSelected = selected === plan.key;
          const isPremium = plan.key === "premium";
          return (
            <button
              key={plan.key}
              onClick={() => setSelected(plan.key)}
              className={`relative text-left rounded-2xl border-2 p-5 transition-all duration-200 ${
                isSelected
                  ? "border-[#B09145] bg-[#B09145]/5 shadow-md"
                  : "border-[#EDE9E3] bg-white hover:border-[#B09145]/40"
              }`}
            >
              {isPremium && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#B09145] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-0.5 rounded-full">
                  Most Popular
                </span>
              )}
              <div className="mb-3">
                <p className="text-xs font-bold tracking-[0.1em] uppercase text-[#9E9585] mb-1">{plan.label}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-[#0E1520]">${plan.price}</span>
                  <span className="text-xs text-[#9E9585]">/ {plan.days} days</span>
                </div>
              </div>
              <ul className="space-y-1.5">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-1.5 text-xs text-[#4A5568]">
                    {CHECK}
                    {perk}
                  </li>
                ))}
              </ul>
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#B09145] flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Summary + CTA */}
      <div className="bg-white border border-[#EDE9E3] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-[#0E1520]">
              {PROMOTION_PLANS.find((p) => p.key === selected)?.label} Plan
            </p>
            <p className="text-xs text-[#9E9585]">
              {PROMOTION_PLANS.find((p) => p.key === selected)?.days} days · Free during beta
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-[#B09145]">$0.00</p>
            <p className="text-[10px] text-[#9E9585] line-through">
              ${PROMOTION_PLANS.find((p) => p.key === selected)?.price}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleActivate}
          disabled={submitting}
          className="tt-btn-gold w-full py-3 rounded-xl text-sm disabled:opacity-50"
        >
          {submitting ? "Activating…" : "Activate Promotion — Free"}
        </button>

        <p className="text-center text-[10px] text-[#9E9585] mt-3">
          You can also{" "}
          <Link href={`/listings/${listing.id}`} className="text-[#B09145] hover:underline">
            skip for now
          </Link>{" "}
          and promote later from your listing.
        </p>
      </div>
    </div>
  );
}
