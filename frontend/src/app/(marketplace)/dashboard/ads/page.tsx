"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { listingsApi } from "@/lib/listings-api";
import { storesApi } from "@/lib/stores-api";
import { repairsApi } from "@/lib/repairs-api";
import {
  MyListing, ListingPromotion,
  StoreDetail, StorePromotion,
  RepairShopDetail, RepairPromotion,
} from "@/types";

interface ListingWithPromo {
  listing: MyListing;
  promotion: ListingPromotion | null;
}

function daysLeft(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function StatusBadge({ active, days }: { active: boolean; days: number }) {
  if (!active) return (
    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#F0EDE8] text-[#9E9585]">Expired</span>
  );
  if (days <= 7) return (
    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Expires soon</span>
  );
  return (
    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>
  );
}

function DaysBar({ days, total }: { days: number; total: number }) {
  const pct = Math.min(100, Math.round((days / total) * 100));
  const color = days <= 7 ? "bg-amber-400" : "bg-[#B09145]";
  return (
    <div className="mt-2">
      <div className="h-1.5 bg-[#EDE9E3] rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[10px] text-[#9E9585] mt-1">{days} day{days !== 1 ? "s" : ""} remaining</p>
    </div>
  );
}

const SECTION_ICON = (
  <svg className="w-4 h-4 text-[#B09145]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
  </svg>
);

export default function AdsManagementPage() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();

  const [listingsWithPromos, setListingsWithPromos] = useState<ListingWithPromo[]>([]);
  const [store, setStore]                           = useState<StoreDetail | null>(null);
  const [storePromo, setStorePromo]                 = useState<StorePromotion | null>(null);
  const [shop, setShop]                             = useState<RepairShopDetail | null>(null);
  const [shopPromo, setShopPromo]                   = useState<RepairPromotion | null>(null);
  const [loading, setLoading]                       = useState(true);

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) { router.push("/login"); return; }

    const load = async () => {
      const results = await Promise.allSettled([
        listingsApi.mine(),
        storesApi.mine(),
        repairsApi.mine(),
      ]);

      // Listings
      if (results[0].status === "fulfilled") {
        const listings = results[0].value.data.results;
        const withPromos = await Promise.all(
          listings.map(async (l) => {
            try {
              const { data } = await listingsApi.getPromotion(l.id);
              return { listing: l, promotion: data };
            } catch {
              return { listing: l, promotion: null };
            }
          })
        );
        setListingsWithPromos(withPromos.filter((lp) => lp.promotion !== null));
      }

      // Store
      if (results[1].status === "fulfilled") {
        const s = results[1].value.data;
        setStore(s);
        try {
          const { data } = await storesApi.getPromotion(s.slug);
          setStorePromo(data);
        } catch { /* no promo */ }
      }

      // Repair shop
      if (results[2].status === "fulfilled") {
        const r = results[2].value.data;
        setShop(r);
        try {
          const { data } = await repairsApi.getPromotion(r.slug);
          setShopPromo(data);
        } catch { /* no promo */ }
      }

      setLoading(false);
    };

    load();
  }, [isInitialized, user, router]);

  const activeListings  = listingsWithPromos.filter((lp) => lp.promotion?.is_active && !lp.promotion?.is_expired);
  const expiredListings = listingsWithPromos.filter((lp) => !lp.promotion?.is_active || lp.promotion?.is_expired);
  const storeActive     = storePromo?.is_active && !storePromo?.is_expired;
  const shopActive      = shopPromo?.is_active && !shopPromo?.is_expired;
  const totalActive     = activeListings.length + (storeActive ? 1 : 0) + (shopActive ? 1 : 0);

  if (!isInitialized || loading) return (
    <div className="max-w-3xl mx-auto px-4 py-16 animate-pulse space-y-6">
      <div className="h-6 bg-[#EDE9E3] rounded w-1/4" />
      <div className="grid grid-cols-3 gap-4">
        {[0,1,2].map((i) => <div key={i} className="h-24 bg-[#EDE9E3] rounded-2xl" />)}
      </div>
      <div className="h-48 bg-[#EDE9E3] rounded-2xl" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0E1520]">My Advertisements</h1>
        <p className="text-sm text-[#9E9585] mt-1">All your active and past promotions in one place.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-white border border-[#EDE9E3] rounded-2xl p-4">
          <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#9E9585] mb-1">Active Ads</p>
          <p className="text-3xl font-bold text-[#0E1520]">{totalActive}</p>
        </div>
        <div className="bg-white border border-[#EDE9E3] rounded-2xl p-4">
          <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#9E9585] mb-1">Listing Ads</p>
          <p className="text-3xl font-bold text-[#0E1520]">{activeListings.length}</p>
        </div>
        <div className="bg-white border border-[#EDE9E3] rounded-2xl p-4">
          <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#9E9585] mb-1">Directory Ads</p>
          <p className="text-3xl font-bold text-[#0E1520]">{(storeActive ? 1 : 0) + (shopActive ? 1 : 0)}</p>
        </div>
      </div>

      {/* ── Store promotion ────────────────────────────────── */}
      {store && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            {SECTION_ICON}
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#9E9585]">Store</p>
          </div>
          <div className="bg-white border border-[#EDE9E3] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-3 min-w-0">
                {store.logo_url
                  ? <img src={store.logo_url} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                  : <div className="w-10 h-10 rounded-xl bg-[#F0EDE8] flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-[#B09145]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" /></svg>
                    </div>
                }
                <div className="min-w-0">
                  <p className="font-semibold text-[#0E1520] truncate">{store.name}</p>
                  {storePromo && !storePromo.is_expired ? (
                    <>
                      <p className="text-xs text-[#9E9585]">{storePromo.plan_label} · expires {formatDate(storePromo.expires_at)}</p>
                      <DaysBar days={daysLeft(storePromo.expires_at)} total={storePromo.plan === "spotlight" ? 30 : storePromo.plan === "featured" ? 90 : 180} />
                    </>
                  ) : (
                    <p className="text-xs text-[#9E9585]">No active promotion</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                {storePromo && <StatusBadge active={storePromo.is_active} days={daysLeft(storePromo.expires_at)} />}
                <Link
                  href="/dashboard/store"
                  className="text-xs font-semibold text-[#B09145] hover:underline whitespace-nowrap"
                  onClick={() => sessionStorage.setItem("storeTab", "advertise")}
                >
                  {storeActive ? "Manage" : "Advertise"}
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Repair shop promotion ──────────────────────────── */}
      {shop && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            {SECTION_ICON}
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#9E9585]">Repair Shop</p>
          </div>
          <div className="bg-white border border-[#EDE9E3] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-3 min-w-0">
                {shop.logo_url
                  ? <img src={shop.logo_url} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                  : <div className="w-10 h-10 rounded-xl bg-[#F0EDE8] flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-[#B09145]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l5.654-4.654m5.896-3.83a9 9 0 10-9.9 9.9M6.75 9.75a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" /></svg>
                    </div>
                }
                <div className="min-w-0">
                  <p className="font-semibold text-[#0E1520] truncate">{shop.name}</p>
                  {shopPromo && !shopPromo.is_expired ? (
                    <>
                      <p className="text-xs text-[#9E9585]">{shopPromo.plan_label} · expires {formatDate(shopPromo.expires_at)}</p>
                      <DaysBar days={daysLeft(shopPromo.expires_at)} total={shopPromo.plan === "1m" ? 30 : shopPromo.plan === "3m" ? 90 : 180} />
                    </>
                  ) : (
                    <p className="text-xs text-[#9E9585]">No active promotion</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                {shopPromo && <StatusBadge active={shopPromo.is_active} days={daysLeft(shopPromo.expires_at)} />}
                <Link href="/dashboard/repairs" className="text-xs font-semibold text-[#B09145] hover:underline whitespace-nowrap">
                  {shopActive ? "Manage" : "Advertise"}
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Listing promotions ─────────────────────────────── */}
      {listingsWithPromos.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            {SECTION_ICON}
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#9E9585]">Watch Listings</p>
          </div>
          <div className="bg-white border border-[#EDE9E3] rounded-2xl divide-y divide-[#EDE9E3] overflow-hidden">
            {[...activeListings, ...expiredListings].map(({ listing, promotion }) => {
              const active = promotion?.is_active && !promotion?.is_expired;
              const days   = promotion ? daysLeft(promotion.expires_at) : 0;
              const total  = promotion?.plan === "1m" ? 30 : promotion?.plan === "3m" ? 90 : 180;
              return (
                <div key={listing.id} className="flex items-center justify-between p-4 gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {listing.primary_image
                      ? <img src={listing.primary_image.url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      : <div className="w-10 h-10 rounded-lg bg-[#F0EDE8] flex-shrink-0" />
                    }
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-[#0E1520] truncate">{listing.brand} {listing.model}</p>
                      {promotion ? (
                        <>
                          <p className="text-xs text-[#9E9585]">{promotion.plan_label} · expires {formatDate(promotion.expires_at)}</p>
                          {active && <DaysBar days={days} total={total} />}
                        </>
                      ) : (
                        <p className="text-xs text-[#9E9585]">No promotion</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {promotion && <StatusBadge active={!!active} days={days} />}
                    <Link
                      href={`/sell/promote/${listing.id}`}
                      className="text-xs font-semibold text-[#B09145] hover:underline whitespace-nowrap"
                    >
                      {active ? "Renew" : "Promote"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Empty state */}
      {totalActive === 0 && listingsWithPromos.length === 0 && !store && !shop && (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-full bg-[#B09145]/10 border border-[#B09145]/20 flex items-center justify-center mx-auto mb-4">
            {SECTION_ICON}
          </div>
          <p className="font-semibold text-[#0E1520] mb-1">No advertisements yet</p>
          <p className="text-sm text-[#9E9585] mb-6">Promote your listings, store, or repair shop to get more visibility.</p>
          <Link href="/sell/listings" className="tt-btn-gold py-2.5 px-6 rounded-xl text-sm">Browse Listings</Link>
        </div>
      )}

      {/* No active ads but has entities */}
      {totalActive === 0 && (listingsWithPromos.length > 0 || store || shop) && (
        <div className="bg-[#B09145]/8 border border-[#B09145]/20 rounded-2xl px-5 py-4 flex items-start gap-3">
          <svg className="w-4 h-4 text-[#B09145] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-[#0E1520]">No active promotions</p>
            <p className="text-xs text-[#9E9585] mt-0.5">Activate a promotion to boost your visibility in the directory and search results.</p>
          </div>
        </div>
      )}
    </div>
  );
}
