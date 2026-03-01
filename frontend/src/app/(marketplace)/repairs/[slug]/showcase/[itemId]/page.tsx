"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { repairsApi } from "@/lib/repairs-api";
import { RepairShowcase, RepairShopCard } from "@/types";

export default function ShowcaseItemPage() {
  const { slug, itemId } = useParams<{ slug: string; itemId: string }>();
  const router = useRouter();

  const [item, setItem]   = useState<RepairShowcase | null>(null);
  const [shop, setShop]   = useState<RepairShopCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<"before" | "after" | null>(null);

  useEffect(() => {
    Promise.all([
      repairsApi.getShowcaseItem(slug, itemId),
      repairsApi.get(slug),
    ])
      .then(([{ data: sc }, { data: sh }]) => { setItem(sc); setShop(sh as unknown as RepairShopCard); })
      .catch(() => router.push(`/repairs/${slug}`))
      .finally(() => setLoading(false));
  }, [slug, itemId, router]);

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse space-y-4">
      <div className="h-6 bg-[#EDE9E3] rounded w-1/3" />
      <div className="h-80 bg-[#EDE9E3] rounded-2xl" />
      <div className="h-32 bg-[#EDE9E3] rounded-2xl" />
    </div>
  );

  if (!item || !shop) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[#9E9585] mb-6 flex-wrap">
        <Link href="/repairs" className="hover:text-[#B09145] transition-colors">Repairs</Link>
        <span>/</span>
        <Link href={`/repairs/${slug}`} className="hover:text-[#B09145] transition-colors">{shop.name}</Link>
        <span>/</span>
        <span className="text-[#0E1520]">Portfolio</span>
      </nav>

      {/* Title */}
      <div className="mb-6">
        <p className="tt-section-label text-[#B09145] mb-1">Portfolio</p>
        <h1 className="font-display italic text-3xl sm:text-4xl text-[#0E1520] mb-2">{item.title}</h1>
        {(item.watch_brand || item.watch_model) && (
          <p className="text-sm font-semibold text-[#B09145]">
            {[item.watch_brand, item.watch_model].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>

      {/* Before / After images */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Before */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9E9585] mb-2">Before</p>
          <div
            onClick={() => setLightbox("before")}
            className="relative aspect-square rounded-2xl overflow-hidden cursor-zoom-in bg-[#F0EDE8] group"
          >
            <Image
              src={item.before_image_url}
              alt={`Before — ${item.title}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
              </svg>
            </div>
          </div>
        </div>

        {/* After */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9E9585] mb-2">After</p>
          {item.after_image_url ? (
            <div
              onClick={() => setLightbox("after")}
              className="relative aspect-square rounded-2xl overflow-hidden cursor-zoom-in bg-[#F0EDE8] group"
            >
              <Image
                src={item.after_image_url}
                alt={`After — ${item.title}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                </svg>
              </div>
            </div>
          ) : (
            <div className="aspect-square rounded-2xl bg-[#F0EDE8] flex items-center justify-center">
              <p className="text-sm text-[#C8C0B0]">No after photo</p>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {item.description && (
        <div className="bg-white border border-[#EDE9E3] rounded-2xl p-6 mb-6">
          <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#9E9585] mb-3">About This Work</p>
          <p className="text-sm text-[#0E1520] leading-relaxed whitespace-pre-line">{item.description}</p>
        </div>
      )}

      {/* Details grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {item.watch_brand && (
          <div className="bg-white border border-[#EDE9E3] rounded-xl p-4">
            <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#9E9585] mb-1">Brand</p>
            <p className="text-sm font-semibold text-[#0E1520]">{item.watch_brand}</p>
          </div>
        )}
        {item.watch_model && (
          <div className="bg-white border border-[#EDE9E3] rounded-xl p-4">
            <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#9E9585] mb-1">Model</p>
            <p className="text-sm font-semibold text-[#0E1520]">{item.watch_model}</p>
          </div>
        )}
        <div className="bg-white border border-[#EDE9E3] rounded-xl p-4">
          <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#9E9585] mb-1">Completed</p>
          <p className="text-sm font-semibold text-[#0E1520]">
            {new Date(item.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long" })}
          </p>
        </div>
      </div>

      {/* Back to shop CTA */}
      <div className="bg-white border border-[#EDE9E3] rounded-2xl p-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="font-semibold text-[#0E1520]">{shop.name}</p>
          <p className="text-xs text-[#9E9585] mt-0.5">View the full shop profile and book an appointment</p>
        </div>
        <Link
          href={`/repairs/${slug}`}
          className="tt-btn-gold py-2.5 px-6 rounded-xl text-sm flex-shrink-0"
        >
          Visit Shop
        </Link>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative w-full max-w-3xl max-h-[85vh] aspect-square" onClick={(e) => e.stopPropagation()}>
            <Image
              src={lightbox === "before" ? item.before_image_url : item.after_image_url!}
              alt={lightbox === "before" ? "Before" : "After"}
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
