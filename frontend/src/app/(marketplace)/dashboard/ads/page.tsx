"use client";

import { useEffect, useMemo, useState } from "react";
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
  STORE_PROMOTION_PLANS, REPAIR_PROMOTION_PLANS,
} from "@/types";

interface ListingWithPromo {
  listing: MyListing;
  promotion: ListingPromotion | null;
}

type ListingFilter = "all" | "active" | "expiring" | "expired" | "none";
type SortKey = "expiry" | "name" | "plan";

function daysLeft(iso: string) {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));
}
function planDays(plan: string) {
  return plan === "1m" || plan === "spotlight" ? 30 : plan === "3m" || plan === "featured" ? 90 : 180;
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function isActive(p: ListingPromotion | StorePromotion | RepairPromotion | null) {
  return !!p && p.is_active && !p.is_expired;
}
function isExpiring(p: ListingPromotion | StorePromotion | RepairPromotion | null) {
  return isActive(p) && daysLeft(p!.expires_at) <= 7;
}

// ── Sub-components ────────────────────────────────────────

function StatusBadge({ promo }: { promo: ListingPromotion | StorePromotion | RepairPromotion | null }) {
  if (!promo) return null;
  if (!isActive(promo))
    return <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#F0EDE8] text-[#9E9585]">Expired</span>;
  if (isExpiring(promo))
    return <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Expiring soon</span>;
  return <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>;
}

function DaysBar({ days, total }: { days: number; total: number }) {
  const pct = Math.min(100, Math.round((days / total) * 100));
  return (
    <div className="mt-1.5 w-full">
      <div className="h-1.5 bg-[#EDE9E3] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${days <= 7 ? "bg-amber-400" : "bg-[#B09145]"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[10px] text-[#9E9585] mt-1">{days} day{days !== 1 ? "s" : ""} remaining</p>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-white border border-[#EDE9E3] rounded-2xl p-4">
      <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#9E9585] mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color ?? "text-[#0E1520]"}`}>{value}</p>
    </div>
  );
}

const STORE_ICON = (
  <svg className="w-5 h-5 text-[#B09145]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
  </svg>
);
const REPAIR_ICON = (
  <svg className="w-5 h-5 text-[#B09145]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l5.654-4.654m5.896-3.83a9 9 0 10-9.9 9.9M6.75 9.75a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" />
  </svg>
);
const STAR_ICON = (
  <svg className="w-4 h-4 text-[#B09145]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
  </svg>
);
const CHECK_ICON = (
  <svg className="w-3 h-3 text-[#B09145] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

// ── Directory promotion card ──────────────────────────────

function DirectoryPromoCard({
  type, name, logoUrl, promo, plans, href,
}: {
  type: "store" | "repair";
  name: string;
  logoUrl: string | null;
  promo: StorePromotion | RepairPromotion | null;
  plans: { key: string; label: string; days: number; price: string | number; perks: string[]; }[];
  href: string;
}) {
  const active   = isActive(promo);
  const expiring = isExpiring(promo);
  const days     = promo && active ? daysLeft(promo.expires_at) : 0;
  const total    = promo ? planDays(promo.plan) : 30;
  const planInfo = promo ? plans.find((p) => p.key === promo.plan) : null;
  const isHighest = promo ? promo.plan === plans[plans.length - 1].key : false;

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden ${expiring ? "border-amber-200" : "border-[#EDE9E3]"}`}>
      {expiring && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-[11px] font-semibold text-amber-700">Promotion expiring in {days} day{days !== 1 ? "s" : ""} — renew to stay featured</p>
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {logoUrl
              ? <img src={logoUrl} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
              : <div className="w-12 h-12 rounded-xl bg-[#F0EDE8] flex items-center justify-center flex-shrink-0">
                  {type === "store" ? STORE_ICON : REPAIR_ICON}
                </div>
            }
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-[#0E1520] truncate">{name}</p>
                <StatusBadge promo={promo} />
              </div>
              {active && promo ? (
                <>
                  <p className="text-xs text-[#9E9585] mt-0.5">{promo.plan_label} · expires {formatDate(promo.expires_at)}</p>
                  <DaysBar days={days} total={total} />
                </>
              ) : (
                <p className="text-xs text-[#9E9585] mt-0.5">{promo && !active ? `Expired ${formatDate(promo.expires_at)}` : "No active promotion"}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end flex-shrink-0">
            <Link href={href} className="tt-btn-gold py-1.5 px-4 rounded-xl text-xs whitespace-nowrap">
              {active && !isHighest ? "Upgrade" : active ? "Manage" : "Advertise"}
            </Link>
            {active && (
              <Link href={`${href}#advertise`} className="text-[11px] text-[#9E9585] hover:text-[#B09145] whitespace-nowrap">
                {isHighest ? "Renew" : "View plans"}
              </Link>
            )}
          </div>
        </div>

        {/* Plan perks */}
        {planInfo && active && (
          <div className="mt-4 pt-4 border-t border-[#EDE9E3]">
            <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#9E9585] mb-2">Current plan — {planInfo.label} ({planInfo.price}€)</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {planInfo.perks.map((perk) => (
                <span key={perk} className="flex items-center gap-1 text-[11px] text-[#4A5568]">
                  {CHECK_ICON}{perk}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Upgrade suggestion */}
        {active && !isHighest && (
          <div className="mt-3 bg-[#B09145]/6 border border-[#B09145]/20 rounded-xl px-3 py-2 flex items-center justify-between">
            <p className="text-[11px] text-[#9E9585]">Upgrade to <span className="font-semibold text-[#0E1520]">{plans[plans.indexOf(planInfo!) + 1]?.label}</span> for more visibility</p>
            <Link href={href} className="text-[11px] font-semibold text-[#B09145] hover:underline whitespace-nowrap ml-3">Upgrade →</Link>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────

export default function AdsManagementPage() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();

  const [all, setAll]         = useState<ListingWithPromo[]>([]);
  const [store, setStore]     = useState<StoreDetail | null>(null);
  const [storePromo, setStorePromo] = useState<StorePromotion | null>(null);
  const [shop, setShop]       = useState<RepairShopDetail | null>(null);
  const [shopPromo, setShopPromo]   = useState<RepairPromotion | null>(null);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter]   = useState<ListingFilter>("all");
  const [search, setSearch]   = useState("");
  const [sort, setSort]       = useState<SortKey>("expiry");

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) { router.push("/login"); return; }

    (async () => {
      const [listRes, storeRes, repairRes] = await Promise.allSettled([
        listingsApi.mine(),
        storesApi.mine(),
        repairsApi.mine(),
      ]);

      if (listRes.status === "fulfilled") {
        const listings = listRes.value.data.results;
        const withPromos = await Promise.all(
          listings.map(async (l) => {
            try { const { data } = await listingsApi.getPromotion(l.id); return { listing: l, promotion: data }; }
            catch { return { listing: l, promotion: null }; }
          })
        );
        setAll(withPromos);
      }

      if (storeRes.status === "fulfilled") {
        const s = storeRes.value.data;
        setStore(s);
        try { const { data } = await storesApi.getPromotion(s.slug); setStorePromo(data); } catch {}
      }

      if (repairRes.status === "fulfilled") {
        const r = repairRes.value.data;
        setShop(r);
        try { const { data } = await repairsApi.getPromotion(r.slug); setShopPromo(data); } catch {}
      }

      setLoading(false);
    })();
  }, [isInitialized, user, router]);

  // Stats
  const activeList   = all.filter((lp) => isActive(lp.promotion));
  const expiringList = all.filter((lp) => isExpiring(lp.promotion));
  const expiredList  = all.filter((lp) => lp.promotion && !isActive(lp.promotion));
  const noneList     = all.filter((lp) => !lp.promotion);
  const dirActive    = (isActive(storePromo) ? 1 : 0) + (isActive(shopPromo) ? 1 : 0);
  const totalActive  = activeList.length + dirActive;
  const totalExpiring = expiringList.length + (isExpiring(storePromo) ? 1 : 0) + (isExpiring(shopPromo) ? 1 : 0);

  // Filtered + sorted listings
  const visible = useMemo(() => {
    let list = all;
    if (filter === "active")   list = activeList;
    if (filter === "expiring") list = expiringList;
    if (filter === "expired")  list = expiredList;
    if (filter === "none")     list = noneList;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((lp) =>
        `${lp.listing.brand} ${lp.listing.model}`.toLowerCase().includes(q)
      );
    }

    return [...list].sort((a, b) => {
      if (sort === "name") return `${a.listing.brand} ${a.listing.model}`.localeCompare(`${b.listing.brand} ${b.listing.model}`);
      if (sort === "plan") {
        const pa = a.promotion?.plan ?? "z";
        const pb = b.promotion?.plan ?? "z";
        return pa.localeCompare(pb);
      }
      // expiry: active first, then by days left asc, then no promo last
      const da = a.promotion && isActive(a.promotion) ? daysLeft(a.promotion.expires_at) : Infinity;
      const db = b.promotion && isActive(b.promotion) ? daysLeft(b.promotion.expires_at) : Infinity;
      return da - db;
    });
  }, [all, filter, search, sort, activeList, expiringList, expiredList, noneList]);

  const FILTERS: { key: ListingFilter; label: string; count: number }[] = [
    { key: "all",      label: "All",           count: all.length },
    { key: "active",   label: "Active",        count: activeList.length },
    { key: "expiring", label: "Expiring soon", count: expiringList.length },
    { key: "expired",  label: "Expired",       count: expiredList.length },
    { key: "none",     label: "Not promoted",  count: noneList.length },
  ];

  if (!isInitialized || loading) return (
    <div className="max-w-3xl mx-auto px-4 py-16 animate-pulse space-y-6">
      <div className="h-6 bg-[#EDE9E3] rounded w-1/4" />
      <div className="grid grid-cols-4 gap-4">
        {[0,1,2,3].map((i) => <div key={i} className="h-24 bg-[#EDE9E3] rounded-2xl" />)}
      </div>
      {[0,1,2].map((i) => <div key={i} className="h-28 bg-[#EDE9E3] rounded-2xl" />)}
    </div>
  );

  const hasAnything = all.length > 0 || store || shop;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0E1520]">My Advertisements</h1>
          <p className="text-sm text-[#9E9585] mt-1">Manage all your active promotions in one place.</p>
        </div>
        {all.some((lp) => !lp.promotion) && (
          <Link href="/sell/listings" className="tt-btn-gold py-2 px-4 rounded-xl text-xs whitespace-nowrap">
            + Promote a listing
          </Link>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        <StatCard label="Active" value={totalActive} color="text-emerald-600" />
        <StatCard label="Expiring soon" value={totalExpiring} color={totalExpiring > 0 ? "text-amber-600" : "text-[#0E1520]"} />
        <StatCard label="Expired" value={expiredList.length} />
        <StatCard label="Not promoted" value={noneList.length} />
      </div>

      {/* Global expiring alert */}
      {totalExpiring > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-8 flex items-start gap-3">
          <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {totalExpiring} promotion{totalExpiring !== 1 ? "s" : ""} expiring within 7 days
            </p>
            <p className="text-xs text-amber-700 mt-0.5">Renew now to maintain your visibility and avoid losing your featured placement.</p>
          </div>
        </div>
      )}

      {/* ── Directory promotions ──────────────────────────── */}
      {(store || shop) && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            {STAR_ICON}
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#9E9585]">Directory Promotions</p>
          </div>
          <div className="space-y-4">
            {store && (
              <DirectoryPromoCard
                type="store"
                name={store.name}
                logoUrl={store.logo_url}
                promo={storePromo}
                plans={STORE_PROMOTION_PLANS.map((p) => ({ key: p.key, label: p.label, days: p.days, price: p.price, perks: p.perks }))}
                href="/dashboard/store"
              />
            )}
            {shop && (
              <DirectoryPromoCard
                type="repair"
                name={shop.name}
                logoUrl={shop.logo_url}
                promo={shopPromo}
                plans={REPAIR_PROMOTION_PLANS.map((p) => ({ key: p.key, label: p.label, days: p.days, price: p.price, perks: p.perks }))}
                href="/dashboard/repairs"
              />
            )}
          </div>
        </section>
      )}

      {/* ── Listing promotions ────────────────────────────── */}
      {all.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            {STAR_ICON}
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#9E9585]">Watch Listings</p>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 bg-[#F5F3EF] rounded-xl p-1 mb-4 overflow-x-auto">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  filter === f.key
                    ? "bg-white text-[#0E1520] shadow-sm"
                    : "text-[#9E9585] hover:text-[#0E1520]"
                }`}
              >
                {f.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  filter === f.key ? "bg-[#B09145]/10 text-[#B09145]" : "bg-[#EDE9E3] text-[#9E9585]"
                }`}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search + Sort */}
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9585]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by brand or model…"
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#EDE9E3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B09145] bg-white"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="border border-[#EDE9E3] rounded-xl px-3 py-2.5 text-sm text-[#0E1520] bg-white focus:outline-none focus:ring-2 focus:ring-[#B09145]"
            >
              <option value="expiry">Sort: Expiry</option>
              <option value="name">Sort: Name</option>
              <option value="plan">Sort: Plan</option>
            </select>
          </div>

          {/* Listings table */}
          {visible.length === 0 ? (
            <div className="bg-white border border-[#EDE9E3] rounded-2xl py-12 text-center">
              <p className="text-sm text-[#9E9585]">No listings match this filter.</p>
            </div>
          ) : (
            <div className="bg-white border border-[#EDE9E3] rounded-2xl divide-y divide-[#EDE9E3] overflow-hidden">
              {visible.map(({ listing, promotion }) => {
                const active   = isActive(promotion);
                const expiring = isExpiring(promotion);
                const days     = promotion && active ? daysLeft(promotion.expires_at) : 0;
                const total    = promotion ? planDays(promotion.plan) : 30;

                return (
                  <div
                    key={listing.id}
                    className={`flex items-center justify-between p-4 gap-4 ${expiring ? "bg-amber-50/40" : ""}`}
                  >
                    {/* Left: image + info */}
                    <div className="flex items-center gap-3 min-w-0">
                      {listing.primary_image
                        ? <img src={listing.primary_image.url} alt="" className="w-11 h-11 rounded-xl object-cover flex-shrink-0" />
                        : <div className="w-11 h-11 rounded-xl bg-[#F0EDE8] flex-shrink-0" />
                      }
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm text-[#0E1520] truncate">{listing.brand} {listing.model}</p>
                          <StatusBadge promo={promotion} />
                          {!promotion && (
                            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#F0EDE8] text-[#9E9585]">Not promoted</span>
                          )}
                        </div>
                        {promotion && active ? (
                          <>
                            <p className="text-xs text-[#9E9585] mt-0.5">{promotion.plan_label} · expires {formatDate(promotion.expires_at)}</p>
                            <DaysBar days={days} total={total} />
                          </>
                        ) : promotion ? (
                          <p className="text-xs text-[#9E9585] mt-0.5">Expired {formatDate(promotion.expires_at)}</p>
                        ) : (
                          <p className="text-xs text-[#9E9585] mt-0.5">Listed {formatDate(listing.created_at)}</p>
                        )}
                      </div>
                    </div>

                    {/* Right: actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        href={`/listings/${listing.id}`}
                        className="text-[11px] text-[#9E9585] hover:text-[#0E1520] transition-colors"
                        title="View listing"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </Link>
                      <Link
                        href={`/sell/promote/${listing.id}`}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                          active
                            ? "bg-[#B09145]/10 text-[#B09145] hover:bg-[#B09145]/20"
                            : "tt-btn-gold"
                        }`}
                      >
                        {active ? "Renew" : "Promote"}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Empty state */}
      {!hasAnything && (
        <div className="text-center py-20">
          <div className="w-14 h-14 rounded-full bg-[#B09145]/10 border border-[#B09145]/20 flex items-center justify-center mx-auto mb-4">
            {STAR_ICON}
          </div>
          <p className="font-semibold text-[#0E1520] mb-1">No advertisements yet</p>
          <p className="text-sm text-[#9E9585] mb-6">Promote your listings, store, or repair shop to appear featured across the platform.</p>
          <Link href="/sell/listings" className="tt-btn-gold py-2.5 px-6 rounded-xl text-sm">Go to My Listings</Link>
        </div>
      )}
    </div>
  );
}
