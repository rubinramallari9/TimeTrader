"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ListingCard as ListingCardType } from "@/types";
import { listingsApi } from "@/lib/listings-api";
import Image from "next/image";
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
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    title: "Verified Sellers",
    body: "Every seller goes through identity verification. Buy with confidence knowing you're dealing with a trusted counterpart.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
    title: "Direct Communication",
    body: "Message sellers directly and get all the details you need before committing. No intermediaries, no delays.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Trusted Community",
    body: "A curated marketplace of serious collectors and dealers. Detailed listings, honest descriptions, and real photos.",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [featured, setFeatured] = useState<ListingCardType[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    listingsApi.list({ sort: "-created_at" })
      .then(({ data }) => setFeatured(data.results.slice(0, 3)))
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
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#B09145]/30 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 pt-20 pb-20 md:pt-28 md:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left — copy */}
            <div>
              <p className="tt-section-label text-[#B09145] mb-5">The World&apos;s Finest</p>

              <h1 className="tt-hero-headline text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6 leading-[1.02]">
                Where Exceptional<br />
                <span className="text-[#B09145]">Timepieces</span> Find<br />
                New Wrists
              </h1>

              <p className="text-[#9E9585] text-base sm:text-lg max-w-xl mb-10 leading-relaxed">
                Buy and sell pre-owned luxury watches from verified sellers worldwide. Connect directly, browse thousands of pieces, and trade with confidence.
              </p>

              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-xl mb-10">
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
                <Link href="/listings" className="tt-btn-gold py-3 rounded-xl text-sm text-center w-44">
                  Browse Watches
                </Link>
                <Link href="/sell" className="tt-btn-ghost py-3 rounded-xl text-sm text-center w-44">
                  List Your Watch
                </Link>
              </div>
            </div>

            {/* Right — hero watch image */}
            <div className="hidden lg:flex items-center justify-center relative">
              <div className="absolute w-80 h-80 rounded-full bg-[#B09145]/8 blur-3xl" />
              <Image
                src="/hero-watch.jpg"
                alt="Luxury watch"
                width={380}
                height={520}
                className="relative"
                priority
              />
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              List in minutes. Reach thousands of serious collectors worldwide. Verified sellers, direct messaging, and a community that takes watches seriously.
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
            <div className="flex items-center gap-5">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((t) => (
                <Link key={t} href="#" className="text-[11px] text-[#4A5568] hover:text-[#9E9585] transition-colors">{t}</Link>
              ))}
              <span className="text-[#1E2D40]">·</span>
              <a
                href="https://averon.agency"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[#4A5568] hover:text-[#B09145] transition-colors"
              >
                Built by <span className="font-semibold">Averon Agency</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
