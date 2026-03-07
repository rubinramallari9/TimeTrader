"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { listingsApi } from "@/lib/listings-api";
import { useAuthStore } from "@/store/auth";
import { ListingDetail, ListingPromotion, DURATION_PLANS, ADDON_PLANS, DurationKey, AddonKey } from "@/types";

const CHECK = (
  <svg className="w-4 h-4 text-[#B09145] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export default function PromotePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();

  const [listing, setListing]       = useState<ListingDetail | null>(null);
  const [promotion, setPromotion]   = useState<ListingPromotion | null>(null);
  const [duration, setDuration]     = useState<DurationKey>("1m");
  const [addon, setAddon]           = useState<AddonKey>("basic");
  const [loading, setLoading]       = useState(true);
  const [activating, setActivating] = useState(false);
  const [success, setSuccess]       = useState(false);

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) { router.push("/login?from=/sell"); return; }
    Promise.all([listingsApi.get(id), listingsApi.getPromotion(id)])
      .then(([l, p]) => { setListing(l.data); setPromotion(p.data); })
      .catch(() => router.push("/sell"))
      .finally(() => setLoading(false));
  }, [id, isInitialized, user, router]);

  const selectedDuration = DURATION_PLANS.find((d) => d.key === duration)!;
  const selectedAddon    = ADDON_PLANS.find((a) => a.key === addon)!;
  const addonPrice       = selectedAddon.prices[duration];
  const totalPrice       = selectedDuration.price + addonPrice;

  const handleActivate = async () => {
    if (!listing || activating) return;
    setActivating(true);
    try {
      const { data } = await listingsApi.promote(id, duration);
      setPromotion(data);
      setSuccess(true);
    } finally {
      setActivating(false);
    }
  };

  if (!isInitialized || loading) return (
    <div className="max-w-3xl mx-auto px-4 py-16 animate-pulse space-y-4">
      <div className="h-6 bg-[#EDE9E3] rounded w-1/3" />
      <div className="grid grid-cols-3 gap-4 mt-8">
        {[0,1,2].map((i) => <div key={i} className="h-40 bg-[#EDE9E3] rounded-2xl" />)}
      </div>
    </div>
  );

  if (!listing) return null;

  if (success || (promotion?.is_active && !promotion?.is_expired)) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-[#B09145]/10 border border-[#B09145]/30 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-[#B09145]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#0E1520] mb-2">Promotion Active</h1>
        <p className="text-[#9E9585] mb-8">
          <span className="font-semibold text-[#0E1520]">{listing.brand} {listing.model}</span> is now being promoted.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href={`/listings/${listing.id}`} className="tt-btn-gold py-2.5 px-6 rounded-xl text-sm">View Listing</Link>
          <Link href="/sell/listings" className="tt-btn-outline py-2.5 px-6 rounded-xl text-sm">My Listings</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <nav className="text-xs text-[#9E9585] mb-4 flex gap-2 items-center">
        <Link href="/sell/listings" className="hover:text-[#B09145] transition-colors">My Listings</Link>
        <span>/</span>
        <span>Promote</span>
      </nav>
      <h1 className="text-2xl font-bold text-[#0E1520] mb-1">Advertise Your Watch</h1>
      <p className="text-sm text-[#9E9585] mb-8">
        Boost visibility for <span className="font-medium text-[#0E1520]">{listing.brand} {listing.model}</span>.
      </p>

      {/* Step 1 — Duration */}
      <div className="mb-8">
        <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#9E9585] mb-3">Step 1 — Choose Duration</p>
        <div className="grid grid-cols-3 gap-3">
          {DURATION_PLANS.map((plan) => {
            const isSelected = duration === plan.key;
            return (
              <button
                key={plan.key}
                onClick={() => setDuration(plan.key)}
                className={`relative text-left rounded-2xl border-2 p-4 transition-all duration-200 ${
                  isSelected ? "border-[#B09145] bg-[#B09145]/5 shadow-sm" : "border-[#EDE9E3] bg-white hover:border-[#B09145]/40"
                }`}
              >
                <p className="text-xs font-bold text-[#9E9585] mb-1">{plan.label}</p>
                <p className="text-2xl font-bold text-[#0E1520]">{plan.price}€</p>
                <p className="text-[10px] text-[#9E9585] mt-0.5">{plan.days} days</p>
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-[#B09145] flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2 — Add-on */}
      <div className="mb-8">
        <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#9E9585] mb-3">Step 2 — Choose Add-on</p>
        <div className="grid grid-cols-3 gap-3">
          {ADDON_PLANS.map((plan) => {
            const isSelected = addon === plan.key;
            const price      = plan.prices[duration];
            return (
              <button
                key={plan.key}
                onClick={() => setAddon(plan.key)}
                className={`relative text-left rounded-2xl border-2 p-4 transition-all duration-200 ${
                  isSelected
                    ? "border-[#B09145] bg-[#B09145]/5 shadow-sm"
                    : "border-[#EDE9E3] bg-white hover:border-[#B09145]/40"
                }`}
              >
                {plan.key === "premium" && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#B09145] text-white text-[9px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full whitespace-nowrap">
                    Best
                  </span>
                )}
                <p className="text-xs font-bold text-[#9E9585] mb-1">{plan.label}</p>
                <p className="text-2xl font-bold text-[#0E1520]">
                  {price === 0 ? "Free" : `+${price}€`}
                </p>
                <ul className="mt-3 space-y-1">
                  {plan.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-1.5 text-[11px] text-[#4A5568]">
                      {CHECK}
                      {perk}
                    </li>
                  ))}
                </ul>
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-[#B09145] flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary + Activate */}
      <div className="bg-white border border-[#EDE9E3] rounded-2xl p-6">
        <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#9E9585] mb-4">Order Summary</p>
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-[#9E9585]">{selectedDuration.label}</span>
            <span className="font-semibold text-[#0E1520]">{selectedDuration.price}€</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#9E9585]">{selectedAddon.label} add-on</span>
            <span className="font-semibold text-[#0E1520]">
              {addonPrice === 0 ? "Free" : `${addonPrice}€`}
            </span>
          </div>
          <div className="border-t border-[#EDE9E3] pt-2 flex justify-between">
            <span className="text-sm font-bold text-[#0E1520]">Total</span>
            <span className="text-lg font-bold text-[#B09145]">{totalPrice}€</span>
          </div>
        </div>

        <button
          onClick={handleActivate}
          disabled={activating}
          className="w-full tt-btn-gold py-3 rounded-xl text-sm font-semibold disabled:opacity-50"
        >
          {activating ? "Activating…" : "Activate Promotion"}
        </button>

        <p className="text-center text-[10px] text-[#9E9585] mt-3">
          <Link href={`/listings/${listing.id}`} className="text-[#B09145] hover:underline">Skip for now</Link>
        </p>
      </div>
    </div>
  );
}
