"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StoreDetail, StorePromotion, MyListing, STORE_PROMOTION_PLANS } from "@/types";
import { storesApi } from "@/lib/stores-api";
import { listingsApi } from "@/lib/listings-api";
import { useAuthStore } from "@/store/auth";
import StarRating from "@/components/shared/StarRating";

type Tab = "overview" | "watches" | "advertise" | "settings";

const STATUS_BADGE: Record<string, string> = {
  active:  "bg-emerald-50 text-emerald-700 border border-emerald-200",
  sold:    "bg-blue-50 text-blue-700 border border-blue-200",
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  removed: "bg-[#F0EDE8] text-[#9E9585] border border-[#EDE9E3]",
};

export default function StoreDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();

  const [store, setStore]           = useState<StoreDetail | null>(null);
  const [promo, setPromo]           = useState<StorePromotion | null>(null);
  const [listings, setListings]     = useState<MyListing[]>([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState<Tab>("overview");
  const [activatingPlan, setActivatingPlan] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess]     = useState(false);
  const [deleteTarget, setDeleteTarget]     = useState<MyListing | null>(null);
  const [deleting, setDeleting]             = useState(false);
  const [markingId, setMarkingId]           = useState<string | null>(null);

  // Settings form state
  const [form, setForm]           = useState<Partial<StoreDetail>>({});
  const [saving, setSaving]       = useState(false);
  const [saveMsg, setSaveMsg]     = useState<string | null>(null);
  const [logoFile, setLogoFile]   = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) { router.push("/login?from=/dashboard/store"); return; }
    if (user.role !== "store" && user.role !== "admin") { router.push("/"); return; }
    loadAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const { data: s } = await storesApi.mine();
      setStore(s);
      setForm({
        name: s.name, description: s.description, website: s.website,
        phone: s.phone, email: s.email, address: s.address, city: s.city, country: s.country,
      });
      const [listingsRes, promoRes] = await Promise.all([
        listingsApi.mine(),
        storesApi.getPromotion(s.slug),
      ]);
      setListings(listingsRes.data.results);
      setPromo(promoRes.data ?? null);
    } catch {
      // No store yet — go through setup
      router.push("/dashboard/store/setup");
    } finally {
      setLoading(false);
    }
  };

  const handleActivatePlan = async (plan: string) => {
    if (!store || activatingPlan) return;
    setActivatingPlan(plan);
    try {
      const { data } = await storesApi.promote(store.slug, plan as "spotlight" | "featured");
      setPromo(data);
      setPromoSuccess(true);
      setTimeout(() => setPromoSuccess(false), 4000);
    } finally {
      setActivatingPlan(null);
    }
  };

  const handleMarkSold = async (id: string) => {
    if (markingId) return;
    setMarkingId(id);
    try {
      await listingsApi.markAsSold(id);
      setListings((prev) => prev.map((l) => l.id === id ? { ...l, status: "sold" as const } : l));
    } finally {
      setMarkingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await listingsApi.remove(deleteTarget.id);
      setListings((prev) => prev.map((l) => l.id === deleteTarget.id ? { ...l, status: "removed" as const } : l));
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      if (logoFile) await storesApi.uploadLogo(store.slug, logoFile);
      const { data } = await storesApi.update(store.slug, form);
      setStore(data);
      setSaveMsg("Changes saved.");
    } catch {
      setSaveMsg("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const stats = {
    total:   listings.length,
    active:  listings.filter((l) => l.status === "active").length,
    sold:    listings.filter((l) => l.status === "sold").length,
    views:   listings.reduce((s, l) => s + l.views_count, 0),
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const formatPrice = (price: string, currency: string) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD", maximumFractionDigits: 0 }).format(Number(price));

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse space-y-4">
      <div className="h-8 bg-[#EDE9E3] rounded w-1/4" />
      <div className="h-32 bg-[#EDE9E3] rounded-2xl" />
      <div className="h-64 bg-[#EDE9E3] rounded-2xl" />
    </div>
  );

  if (!store) return null;

  const promoActive = promo && !promo.is_expired;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-[#F0EDE8] flex-shrink-0 overflow-hidden">
          {(logoPreview || store.logo_url) ? (
            <Image src={logoPreview ?? store.logo_url!} alt={store.name} width={56} height={56} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xl font-bold text-[#C8C0B0]">{store.name[0]}</div>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0E1520]">{store.name}</h1>
            {store.is_verified && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Verified</span>
            )}
            {promoActive && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#B09145]/10 text-[#B09145] border border-[#B09145]/20">Featured</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <StarRating rating={store.average_rating} count={store.review_count} />
            <Link href={`/stores/${store.slug}`} className="text-xs text-[#9E9585] hover:text-[#B09145] transition-colors">
              View public page →
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-[#F0EDE8] rounded-xl p-1 w-fit overflow-x-auto">
        {(["overview", "watches", "advertise", "settings"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize tracking-wide transition-all whitespace-nowrap ${
              tab === t ? "bg-white text-[#0E1520] shadow-sm" : "text-[#9E9585] hover:text-[#0E1520]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Overview ─────────────────────────────────────── */}
      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Watches",  value: stats.total },
              { label: "Active",         value: stats.active },
              { label: "Sold",           value: stats.sold },
              { label: "Total Views",    value: stats.views.toLocaleString() },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-[#EDE9E3] rounded-2xl px-5 py-4">
                <p className="text-2xl font-bold text-[#0E1520]">{s.value}</p>
                <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#9E9585] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Promotion status */}
          <div className="bg-white border border-[#EDE9E3] rounded-2xl p-5">
            <p className="text-xs font-semibold tracking-[0.1em] uppercase text-[#9E9585] mb-3">Promotion Status</p>
            {promoActive ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[#0E1520]">{promo.plan_label} plan active</p>
                  <p className="text-xs text-[#9E9585] mt-0.5">Expires {formatDate(promo.expires_at)}</p>
                </div>
                <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-[#B09145]/10 text-[#B09145] border border-[#B09145]/20">Active</span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#9E9585]">No active promotion — your store is not featured.</p>
                <button onClick={() => setTab("advertise")} className="tt-btn-gold py-2 px-4 rounded-xl text-xs">
                  Advertise
                </button>
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button onClick={() => setTab("watches")} className="bg-white border border-[#EDE9E3] rounded-2xl p-5 text-left hover:border-[#B09145] transition-colors group">
              <div className="w-9 h-9 rounded-xl bg-[#F0EDE8] flex items-center justify-center mb-3 group-hover:bg-[#B09145]/10 transition-colors">
                <svg className="w-5 h-5 text-[#B09145]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              </div>
              <p className="font-semibold text-sm text-[#0E1520]">Manage Watches</p>
              <p className="text-xs text-[#9E9585] mt-0.5">{stats.active} active listings</p>
            </button>

            <Link href="/sell" className="bg-white border border-[#EDE9E3] rounded-2xl p-5 text-left hover:border-[#B09145] transition-colors group block">
              <div className="w-9 h-9 rounded-xl bg-[#F0EDE8] flex items-center justify-center mb-3 group-hover:bg-[#B09145]/10 transition-colors">
                <svg className="w-5 h-5 text-[#B09145]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <p className="font-semibold text-sm text-[#0E1520]">Add New Watch</p>
              <p className="text-xs text-[#9E9585] mt-0.5">List a watch for sale</p>
            </Link>

            <button onClick={() => setTab("advertise")} className="bg-white border border-[#EDE9E3] rounded-2xl p-5 text-left hover:border-[#B09145] transition-colors group">
              <div className="w-9 h-9 rounded-xl bg-[#F0EDE8] flex items-center justify-center mb-3 group-hover:bg-[#B09145]/10 transition-colors">
                <svg className="w-5 h-5 text-[#B09145]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 010 1.954l-7.108 4.061A1.125 1.125 0 013 16.811V8.69zM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 010 1.954l-7.108 4.061a1.125 1.125 0 01-1.683-.977V8.69z" />
                </svg>
              </div>
              <p className="font-semibold text-sm text-[#0E1520]">Advertise Store</p>
              <p className="text-xs text-[#9E9585] mt-0.5">{promoActive ? `Expires ${formatDate(promo!.expires_at)}` : "Get featured in directory"}</p>
            </button>
          </div>
        </div>
      )}

      {/* ── My Watches ────────────────────────────────────── */}
      {tab === "watches" && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-[#9E9585]">{listings.filter(l => l.status === "active").length} active · {listings.filter(l => l.status === "sold").length} sold</p>
            <Link href="/sell" className="tt-btn-gold py-2 px-4 rounded-xl text-xs">+ Add Watch</Link>
          </div>

          {listings.length === 0 ? (
            <div className="bg-white border border-[#EDE9E3] rounded-2xl px-8 py-16 text-center">
              <p className="text-[#9E9585] text-sm mb-4">No watches listed yet.</p>
              <Link href="/sell" className="tt-btn-gold py-2.5 px-6 rounded-xl text-sm inline-block">List Your First Watch</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {listings.map((listing) => (
                <div key={listing.id} className="bg-white border border-[#EDE9E3] rounded-2xl flex items-center gap-4 p-3 sm:p-4">
                  <Link href={`/listings/${listing.id}`} className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#F0EDE8]">
                      {listing.primary_image ? (
                        <Image src={listing.primary_image.url} alt={listing.title} width={64} height={64} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-[#C8C0B0]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[listing.status]}`}>
                        {listing.status}
                      </span>
                      {listing.is_featured && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#B09145]/10 text-[#B09145] border border-[#B09145]/20">Promoted</span>
                      )}
                    </div>
                    <p className="font-semibold text-sm text-[#0E1520] truncate">{listing.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-sm font-bold text-[#0E1520]">{formatPrice(listing.price, listing.currency)}</span>
                      <span className="text-[11px] text-[#9E9585]">{listing.views_count} views</span>
                      <span className="text-[11px] text-[#9E9585] hidden sm:block">{formatDate(listing.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {listing.status === "active" && (
                      <>
                        <Link href={`/sell/edit/${listing.id}`} className="hidden sm:inline-flex text-xs font-semibold text-[#9E9585] hover:text-[#0E1520] border border-[#EDE9E3] rounded-lg px-3 py-1.5 transition-colors">Edit</Link>
                        <Link href={`/sell/promote/${listing.id}`} className="hidden sm:inline-flex text-xs font-semibold text-[#B09145] border border-[#B09145]/30 rounded-lg px-3 py-1.5 transition-colors">Promote</Link>
                        <button
                          onClick={() => handleMarkSold(listing.id)}
                          disabled={markingId === listing.id}
                          className="hidden sm:inline-flex text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                        >
                          {markingId === listing.id ? "..." : "Mark Sold"}
                        </button>
                      </>
                    )}
                    {listing.status !== "removed" && (
                      <button
                        onClick={() => setDeleteTarget(listing)}
                        className="p-2 rounded-lg border border-[#EDE9E3] text-[#C8C0B0] hover:text-red-500 hover:border-red-200 transition-colors"
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
        </div>
      )}

      {/* ── Advertise ─────────────────────────────────────── */}
      {tab === "advertise" && (
        <div>
          {/* Beta banner */}
          <div className="bg-[#B09145]/10 border border-[#B09145]/25 rounded-2xl px-5 py-4 mb-6 flex items-center gap-3">
            <svg className="w-5 h-5 text-[#B09145] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-[#B09145]">Beta — All plans are free during launch</p>
              <p className="text-xs text-[#9E9585]">Get your store featured now, pricing will apply after launch.</p>
            </div>
          </div>

          {promoSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-5 py-3 mb-6 text-sm font-medium">
              Store promotion activated. Your store is now featured in the directory.
            </div>
          )}

          {promoActive && (
            <div className="bg-white border border-[#EDE9E3] rounded-2xl p-5 mb-6 flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#0E1520]">Current plan: {promo!.plan_label}</p>
                <p className="text-xs text-[#9E9585] mt-0.5">Active until {formatDate(promo!.expires_at)}</p>
              </div>
              <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {STORE_PROMOTION_PLANS.map((plan) => {
              const isCurrent = promoActive && promo!.plan === plan.key;
              return (
                <div key={plan.key} className={`bg-white border rounded-2xl p-6 flex flex-col ${isCurrent ? "border-[#B09145] ring-1 ring-[#B09145]/30" : "border-[#EDE9E3]"}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-lg text-[#0E1520]">{plan.label}</p>
                      <p className="text-[10px] font-semibold tracking-widest uppercase text-[#9E9585]">{plan.days}-day promotion</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs line-through text-[#C8C0B0]">${plan.price}</p>
                      <p className="text-sm font-bold text-[#B09145]">Free</p>
                    </div>
                  </div>

                  <ul className="space-y-1.5 mb-5 flex-1">
                    {plan.perks.map((perk) => (
                      <li key={perk} className="flex items-center gap-2 text-xs text-[#9E9585]">
                        <svg className="w-3.5 h-3.5 text-[#B09145] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {perk}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleActivatePlan(plan.key)}
                    disabled={!!activatingPlan || isCurrent}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isCurrent
                        ? "bg-[#B09145]/10 text-[#B09145] cursor-default"
                        : "tt-btn-gold hover:opacity-90 disabled:opacity-50"
                    }`}
                  >
                    {isCurrent ? "Current Plan" : activatingPlan === plan.key ? "Activating…" : "Activate Free"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Settings ──────────────────────────────────────── */}
      {tab === "settings" && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Logo */}
          <div className="bg-white border border-[#EDE9E3] rounded-2xl p-5">
            <p className="text-xs font-semibold tracking-[0.1em] uppercase text-[#9E9585] mb-4">Store Logo</p>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-[#F0EDE8] overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => logoRef.current?.click()}>
                {(logoPreview || store.logo_url) ? (
                  <Image src={logoPreview ?? store.logo_url!} alt="Logo" width={64} height={64} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-bold text-[#C8C0B0]">{store.name[0]}</div>
                )}
              </div>
              <div>
                <button type="button" onClick={() => logoRef.current?.click()} className="text-sm font-medium text-[#B09145] hover:text-[#C8A96E] transition-colors">
                  Change logo
                </button>
                <p className="text-[11px] text-[#9E9585] mt-0.5">JPG, PNG — max 5 MB</p>
              </div>
              <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            </div>
          </div>

          {/* Basic info */}
          <div className="bg-white border border-[#EDE9E3] rounded-2xl p-5 space-y-4">
            <p className="text-xs font-semibold tracking-[0.1em] uppercase text-[#9E9585]">Basic Info</p>
            {[
              { label: "Store Name", key: "name", type: "text" },
              { label: "Email", key: "email", type: "email" },
              { label: "Phone", key: "phone", type: "tel" },
              { label: "Website", key: "website", type: "url" },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label className="text-xs font-medium text-[#9E9585] block mb-1">{label}</label>
                <input
                  type={type}
                  value={(form as Record<string, string>)[key] ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full border border-[#EDE9E3] rounded-lg px-3 py-2 text-sm text-[#0E1520] focus:outline-none focus:ring-2 focus:ring-[#B09145] focus:border-transparent transition-shadow"
                />
              </div>
            ))}

            <div>
              <label className="text-xs font-medium text-[#9E9585] block mb-1">Description</label>
              <textarea
                rows={4}
                value={form.description ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full border border-[#EDE9E3] rounded-lg px-3 py-2 text-sm text-[#0E1520] focus:outline-none focus:ring-2 focus:ring-[#B09145] focus:border-transparent transition-shadow resize-none"
              />
            </div>
          </div>

          {/* Location */}
          <div className="bg-white border border-[#EDE9E3] rounded-2xl p-5 space-y-4">
            <p className="text-xs font-semibold tracking-[0.1em] uppercase text-[#9E9585]">Location</p>
            {[
              { label: "Address", key: "address" },
              { label: "City", key: "city" },
              { label: "Country", key: "country" },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="text-xs font-medium text-[#9E9585] block mb-1">{label}</label>
                <input
                  type="text"
                  value={(form as Record<string, string>)[key] ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full border border-[#EDE9E3] rounded-lg px-3 py-2 text-sm text-[#0E1520] focus:outline-none focus:ring-2 focus:ring-[#B09145] focus:border-transparent transition-shadow"
                />
              </div>
            ))}
          </div>

          {saveMsg && (
            <p className={`text-sm font-medium ${saveMsg.includes("Failed") ? "text-red-500" : "text-emerald-600"}`}>{saveMsg}</p>
          )}

          <button type="submit" disabled={saving} className="tt-btn-gold py-3 px-8 rounded-xl text-sm disabled:opacity-50">
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-[#0E1520] mb-1">Remove listing?</h2>
            <p className="text-sm text-[#9E9585] mb-5">
              <span className="font-medium text-[#0E1520]">{deleteTarget.title}</span> will be removed from the marketplace.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 tt-btn-outline py-2.5 rounded-xl text-sm">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50">
                {deleting ? "Removing…" : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
