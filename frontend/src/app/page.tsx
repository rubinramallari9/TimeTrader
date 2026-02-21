"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ListingCard as ListingCardType } from "@/types";
import { listingsApi } from "@/lib/listings-api";
import Navbar from "@/components/shared/Navbar";
import ListingCard from "@/components/listings/ListingCard";

const BRANDS = [
  "Rolex", "Patek Philippe", "Audemars Piguet", "Omega",
  "Cartier", "IWC", "Breitling", "TAG Heuer",
  "Vacheron Constantin", "A. Lange & Söhne", "Panerai", "Richard Mille",
];

const TRUST = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 12c0 6.627 5.373 12 12 12a11.955 11.955 0 006-1.598M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "AI-Powered Authentication",
    body: "Every listing can be independently verified by our Gemini Vision AI. Get a certified authenticity report in minutes.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    title: "Verified Sellers",
    body: "Every seller goes through identity verification. Buy with confidence knowing you're dealing with a trusted counterpart.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    title: "Secure Transactions",
    body: "Stripe-powered escrow payments protect both buyers and sellers. Funds are only released once you confirm delivery.",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [featured, setFeatured] = useState<ListingCardType[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    listingsApi.list({ sort: "-created_at" })
      .then(({ data }) => setFeatured(data.results.slice(0, 6)))
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    router.push(q ? `/listings?search=${encodeURIComponent(q)}` : "/listings");
  };

  const handleBrand = (brand: string) =>
    router.push(`/listings?brand=${encodeURIComponent(brand)}`);

  return (
    <div className="min-h-screen bg-[#F8F6F2]">
      <Navbar />

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="relative bg-[#0E1520] overflow-hidden pt-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,_#132A24_0%,_transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#B09145]/30 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 pt-20 pb-20 md:pt-28 md:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left — copy */}
            <div>
              <p className="tt-section-label text-[#B09145] mb-5">The World&apos;s Finest</p>

              <h1 className="tt-hero-headline text-white text-5xl sm:text-6xl md:text-7xl mb-6 leading-[1.02]">
                Where Exceptional<br />
                <span className="text-[#B09145]">Timepieces</span> Find<br />
                New Wrists
              </h1>

              <p className="text-[#9E9585] text-base sm:text-lg max-w-xl mb-10 leading-relaxed">
                Buy and sell certified pre-owned luxury watches from verified sellers worldwide. Every piece backed by AI authentication.
              </p>

              <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mb-10">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search brand, model, reference..."
                  className="flex-1 bg-[#161E2E] border border-[#1E2D40] rounded-xl px-5 py-4 text-sm text-white placeholder-[#4A5568] focus:outline-none focus:ring-2 focus:ring-[#B09145] focus:border-transparent transition-shadow"
                />
                <button type="submit" className="tt-btn-gold text-xs py-4 px-7 rounded-xl">
                  Search
                </button>
              </form>

              <div className="flex flex-wrap gap-3">
                <Link href="/listings" className="tt-btn-gold py-3 px-7 rounded-xl text-sm">
                  Browse Watches
                </Link>
                <Link href="/sell" className="tt-btn-ghost py-3 px-7 rounded-xl text-sm">
                  List Your Watch
                </Link>
              </div>
            </div>

            {/* Right — watch silhouette */}
            <div className="hidden lg:flex items-center justify-center relative">
              {/* Soft glow behind the watch */}
              <div className="absolute w-80 h-80 rounded-full bg-[#B09145]/8 blur-3xl" />
              <svg
                viewBox="0 0 280 420"
                className="relative w-72 xl:w-80 drop-shadow-2xl"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* ── Strap top ── */}
                <rect x="100" y="0" width="80" height="90" rx="10" fill="#0A0F1A" stroke="#1E2D40" strokeWidth="1.5"/>
                {/* strap buckle holes */}
                <rect x="115" y="15" width="50" height="3" rx="1.5" fill="#1E2D40"/>
                <rect x="115" y="25" width="50" height="3" rx="1.5" fill="#1E2D40"/>
                <rect x="115" y="35" width="50" height="3" rx="1.5" fill="#1E2D40"/>
                <rect x="115" y="45" width="50" height="3" rx="1.5" fill="#1E2D40"/>
                <rect x="115" y="55" width="50" height="3" rx="1.5" fill="#1E2D40"/>
                {/* buckle pin */}
                <circle cx="140" cy="70" r="5" fill="#B09145" opacity="0.8"/>
                <rect x="138" y="64" width="4" height="12" rx="2" fill="#B09145"/>

                {/* ── Case lugs top ── */}
                <path d="M95 85 Q85 90 85 100 L85 105 L195 105 L195 100 Q195 90 185 85 Z" fill="#1A2535" stroke="#2A3A50" strokeWidth="1"/>

                {/* ── Watch case (round, outer) ── */}
                <circle cx="140" cy="210" r="110" fill="#161E2E" stroke="#2A3A50" strokeWidth="2"/>
                {/* Case bezel */}
                <circle cx="140" cy="210" r="105" fill="none" stroke="#B09145" strokeWidth="1.5" strokeDasharray="4 3"/>
                {/* Bezel ring */}
                <circle cx="140" cy="210" r="100" fill="#0E1520" stroke="#1E2D40" strokeWidth="2"/>
                {/* Dial ring */}
                <circle cx="140" cy="210" r="92" fill="#0A1220" stroke="#243040" strokeWidth="1"/>

                {/* ── Dial ── */}
                <circle cx="140" cy="210" r="88" fill="#0D1828"/>

                {/* Minute markers — 60 ticks */}
                {Array.from({ length: 60 }).map((_, i) => {
                  const angle = (i * 6 - 90) * (Math.PI / 180);
                  const isHour = i % 5 === 0;
                  const r1 = isHour ? 74 : 79;
                  const r2 = 85;
                  const x1 = 140 + r1 * Math.cos(angle);
                  const y1 = 210 + r1 * Math.sin(angle);
                  const x2 = 140 + r2 * Math.cos(angle);
                  const y2 = 210 + r2 * Math.sin(angle);
                  return (
                    <line
                      key={i}
                      x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={isHour ? "#B09145" : "#2A3A50"}
                      strokeWidth={isHour ? 2 : 0.8}
                      strokeLinecap="round"
                    />
                  );
                })}

                {/* Hour numerals at 12, 3, 6, 9 */}
                <text x="140" y="148" textAnchor="middle" fill="#C8A96E" fontSize="10" fontFamily="Georgia, serif" fontWeight="600">12</text>
                <text x="222" y="214" textAnchor="middle" fill="#C8A96E" fontSize="10" fontFamily="Georgia, serif" fontWeight="600">3</text>
                <text x="140" y="280" textAnchor="middle" fill="#C8A96E" fontSize="10" fontFamily="Georgia, serif" fontWeight="600">6</text>
                <text x="58" y="214" textAnchor="middle" fill="#C8A96E" fontSize="10" fontFamily="Georgia, serif" fontWeight="600">9</text>

                {/* Brand name on dial */}
                <text x="140" y="186" textAnchor="middle" fill="#B09145" fontSize="9" fontFamily="Georgia, serif" fontStyle="italic" letterSpacing="2">TimeTrader</text>
                <line x1="112" y1="190" x2="168" y2="190" stroke="#B09145" strokeWidth="0.5" opacity="0.5"/>

                {/* Sub-seconds dial at 6 o'clock */}
                <circle cx="140" cy="248" r="14" fill="#0A1018" stroke="#1E2D40" strokeWidth="1"/>
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = (i * 30 - 90) * (Math.PI / 180);
                  const x1 = 140 + 10 * Math.cos(angle);
                  const y1 = 248 + 10 * Math.sin(angle);
                  const x2 = 140 + 12 * Math.cos(angle);
                  const y2 = 248 + 12 * Math.sin(angle);
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#2A3A50" strokeWidth="0.8"/>;
                })}
                {/* Sub-seconds hand */}
                <line x1="140" y1="248" x2="140" y2="238" stroke="#B09145" strokeWidth="1" strokeLinecap="round"/>

                {/* ── Hands ── */}
                {/* Hour hand — pointing ~10 o'clock */}
                <line x1="140" y1="210" x2="111" y2="179" stroke="#EDE9E3" strokeWidth="5" strokeLinecap="round"/>
                {/* Minute hand — pointing ~2 o'clock */}
                <line x1="140" y1="210" x2="172" y2="162" stroke="#EDE9E3" strokeWidth="3.5" strokeLinecap="round"/>
                {/* Seconds hand — red accent */}
                <line x1="140" y1="210" x2="153" y2="148" stroke="#B09145" strokeWidth="1.5" strokeLinecap="round"/>
                {/* Tail of seconds hand */}
                <line x1="140" y1="210" x2="130" y2="238" stroke="#B09145" strokeWidth="1.5" strokeLinecap="round"/>
                {/* Center cap */}
                <circle cx="140" cy="210" r="5" fill="#B09145"/>
                <circle cx="140" cy="210" r="2.5" fill="#0E1520"/>

                {/* Crown on right */}
                <rect x="248" y="203" width="16" height="14" rx="4" fill="#1A2535" stroke="#2A3A50" strokeWidth="1.2"/>
                <line x1="252" y1="206" x2="260" y2="206" stroke="#B09145" strokeWidth="0.8" opacity="0.6"/>
                <line x1="252" y1="210" x2="260" y2="210" stroke="#B09145" strokeWidth="0.8" opacity="0.6"/>
                <line x1="252" y1="214" x2="260" y2="214" stroke="#B09145" strokeWidth="0.8" opacity="0.6"/>

                {/* ── Case lugs bottom ── */}
                <path d="M95 315 Q85 320 85 330 L85 335 L195 335 L195 330 Q195 320 185 315 Z" fill="#1A2535" stroke="#2A3A50" strokeWidth="1"/>

                {/* ── Strap bottom ── */}
                <rect x="100" y="330" width="80" height="90" rx="10" fill="#0A0F1A" stroke="#1E2D40" strokeWidth="1.5"/>
                {/* keeper loop */}
                <rect x="108" y="358" width="64" height="8" rx="4" fill="none" stroke="#1E2D40" strokeWidth="1.5"/>
                {/* strap texture */}
                <rect x="115" y="375" width="50" height="3" rx="1.5" fill="#1E2D40"/>
                <rect x="115" y="385" width="50" height="3" rx="1.5" fill="#1E2D40"/>
                <rect x="115" y="395" width="50" height="3" rx="1.5" fill="#1E2D40"/>
              </svg>
            </div>

          </div>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────── */}
      <section className="bg-[#0A1018] border-b border-[#1E2D40]">
        <div className="max-w-7xl mx-auto px-4 py-5 grid grid-cols-3 divide-x divide-[#1E2D40]">
          {[
            { num: "12,400+", label: "Watches Listed" },
            { num: "3,200+", label: "Verified Sellers" },
            { num: "98+", label: "Countries" },
          ].map((s) => (
            <div key={s.label} className="text-center px-4">
              <p className="font-display italic text-2xl sm:text-3xl text-[#B09145]">{s.num}</p>
              <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#4A5568] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Brand row ──────────────────────────────────── */}
      <section className="border-b border-[#EDE9E3] bg-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <p className="tt-section-label text-[#9E9585] mb-4 text-center">Shop by brand</p>
          <div className="flex gap-2 flex-wrap justify-center">
            {BRANDS.map((brand) => (
              <button
                key={brand}
                onClick={() => handleBrand(brand)}
                className="text-[10px] font-semibold tracking-[0.12em] uppercase px-4 py-2 rounded-full border border-[#EDE9E3] text-[#9E9585] hover:border-[#B09145] hover:text-[#B09145] transition-all duration-200 bg-white"
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fresh arrivals ─────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="tt-section-label text-[#B09145] mb-2">Just Listed</p>
            <h2 className="font-display italic text-4xl text-[#0E1520]">Fresh Arrivals</h2>
          </div>
          <Link
            href="/listings"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-[#B09145] hover:text-[#C8A96E] transition-colors"
          >
            View all
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#EDE9E3] overflow-hidden animate-pulse">
                <div className="aspect-square bg-[#F0EDE8]" />
                <div className="p-4 space-y-2">
                  <div className="h-2.5 bg-[#EDE9E3] rounded w-1/3" />
                  <div className="h-4 bg-[#EDE9E3] rounded w-3/4" />
                  <div className="h-5 bg-[#EDE9E3] rounded w-1/3 mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {featured.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        <div className="text-center mt-8 sm:hidden">
          <Link href="/listings" className="tt-btn-outline py-3 px-8 rounded-xl text-sm inline-block">
            View all watches
          </Link>
        </div>
      </section>

      {/* ── Trust signals ──────────────────────────────── */}
      <section className="bg-[#0E1520]">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <p className="tt-section-label text-[#B09145] mb-3">Why TimeTrader</p>
            <h2 className="font-display italic text-4xl text-white">Buy & Sell with Confidence</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TRUST.map((t) => (
              <div key={t.title} className="text-center group">
                <div className="w-14 h-14 rounded-2xl bg-[#B09145]/10 border border-[#B09145]/20 flex items-center justify-center mx-auto mb-5 text-[#B09145] group-hover:bg-[#B09145]/20 transition-colors">
                  {t.icon}
                </div>
                <h3 className="font-semibold text-white mb-2">{t.title}</h3>
                <p className="text-sm text-[#9E9585] leading-relaxed max-w-xs mx-auto">{t.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Directory teasers ──────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <p className="tt-section-label text-[#B09145] mb-2">More on TimeTrader</p>
          <h2 className="font-display italic text-4xl text-[#0E1520]">The Full Ecosystem</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/stores" className="group relative bg-[#0E1520] rounded-2xl overflow-hidden h-52 flex items-end">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#132A24_0%,_transparent_60%)] pointer-events-none" />
            <div className="relative p-7 w-full">
              <p className="tt-section-label text-[#B09145] mb-1">Authorized Dealers</p>
              <h3 className="font-display italic text-2xl text-white mb-3">Watch Stores</h3>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-[#B09145] group-hover:text-[#C8A96E] transition-colors">
                Browse stores
                <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </div>
          </Link>

          <Link href="/repairs" className="group relative bg-[#132A24] rounded-2xl overflow-hidden h-52 flex items-end">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#0E1520_0%,_transparent_60%)] pointer-events-none" />
            <div className="relative p-7 w-full">
              <p className="tt-section-label text-[#B09145] mb-1">Certified Technicians</p>
              <h3 className="font-display italic text-2xl text-white mb-3">Repair Shops</h3>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-[#B09145] group-hover:text-[#C8A96E] transition-colors">
                Book a service
                <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* ── Sell CTA banner ──────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="bg-[#132A24] rounded-2xl px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="tt-section-label text-[#B09145] mb-2">Sell on TimeTrader</p>
            <h2 className="font-display italic text-3xl md:text-4xl text-white mb-2">
              Your Watch Deserves<br className="hidden sm:block" /> the Right Audience
            </h2>
            <p className="text-[#9E9585] text-sm max-w-md">
              List in minutes. Reach thousands of serious collectors worldwide. Our AI authentication gives buyers the confidence to pay full price.
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Link href="/sell" className="tt-btn-gold py-3 px-7 rounded-xl text-sm whitespace-nowrap">
              Start Selling
            </Link>
            <Link href="/register" className="tt-btn-ghost py-3 px-7 rounded-xl text-sm whitespace-nowrap">
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="bg-[#0A1018] border-t border-[#1E2D40]">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <span className="font-display italic text-2xl text-white">TimeTrader</span>
              <p className="text-xs text-[#9E9585] mt-2 leading-relaxed max-w-[160px]">
                The luxury watch marketplace for discerning collectors.
              </p>
            </div>

            <div>
              <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#4A5568] mb-3">Marketplace</p>
              <ul className="space-y-2">
                {[
                  { href: "/listings", label: "Browse Watches" },
                  { href: "/sell", label: "Sell a Watch" },
                  { href: "/listings/saved", label: "Saved Watches" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-xs text-[#9E9585] hover:text-[#B09145] transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#4A5568] mb-3">Services</p>
              <ul className="space-y-2">
                {[
                  { href: "/stores", label: "Watch Stores" },
                  { href: "/repairs", label: "Repair Shops" },
                  { href: "/authenticate", label: "Authenticate" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-xs text-[#9E9585] hover:text-[#B09145] transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#4A5568] mb-3">Account</p>
              <ul className="space-y-2">
                {[
                  { href: "/login", label: "Sign In" },
                  { href: "/register", label: "Create Account" },
                  { href: "/profile", label: "My Profile" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-xs text-[#9E9585] hover:text-[#B09145] transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-[#1E2D40] pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-[11px] text-[#4A5568]">
              © {new Date().getFullYear()} TimeTrader. All rights reserved.
            </p>
            <div className="flex gap-5">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((t) => (
                <Link key={t} href="#" className="text-[11px] text-[#4A5568] hover:text-[#9E9585] transition-colors">{t}</Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
