"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ListingDetail } from "@/types";
import { listingsApi } from "@/lib/listings-api";
import { useAuthStore } from "@/store/auth";
import { ConditionBadge, AuthBadge, VerifiedBadge } from "@/components/shared/Badge";

const MOVEMENT_LABELS: Record<string, string> = {
  automatic: "Automatic",
  manual: "Manual",
  quartz: "Quartz",
  solar: "Solar",
};

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listingsApi.get(id).then(({ data }) => {
      setListing(data);
      setSaved(data.is_saved);
    }).catch(() => router.push("/listings")).finally(() => setLoading(false));
  }, [id, router]);

  const toggleSave = async () => {
    if (!user || saving || !listing) return;
    setSaving(true);
    try {
      if (saved) {
        await listingsApi.unsave(listing.id);
        setSaved(false);
      } else {
        await listingsApi.save(listing.id);
        setSaved(true);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-pulse">
          <div className="aspect-square bg-gray-100 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-6 bg-gray-100 rounded w-1/3" />
            <div className="h-8 bg-gray-100 rounded w-3/4" />
            <div className="h-10 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) return null;

  const price = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: listing.currency || "USD",
    maximumFractionDigits: 0,
  }).format(Number(listing.price));

  const allImages = listing.images;
  const currentImage = allImages[activeImage];

  const isOwner = user?.id === listing.seller.id;

  const specs = [
    { label: "Brand", value: listing.brand },
    { label: "Model", value: listing.model },
    ...(listing.reference_number ? [{ label: "Reference", value: listing.reference_number }] : []),
    ...(listing.year ? [{ label: "Year", value: listing.year }] : []),
    ...(listing.movement_type ? [{ label: "Movement", value: MOVEMENT_LABELS[listing.movement_type] }] : []),
    ...(listing.case_material ? [{ label: "Case Material", value: listing.case_material }] : []),
    ...(listing.case_diameter_mm ? [{ label: "Case Diameter", value: `${listing.case_diameter_mm}mm` }] : []),
    { label: "Condition", value: listing.condition },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-6 flex gap-2">
        <Link href="/listings" className="hover:text-gray-700">Browse</Link>
        <span>/</span>
        <span className="text-gray-600">{listing.brand} {listing.model}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3">
            {currentImage ? (
              <Image
                src={currentImage.url}
                alt={listing.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {allImages.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-colors ${
                    activeImage === i ? "border-gray-900" : "border-transparent"
                  }`}
                >
                  <Image src={img.url} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">{listing.brand}</span>
            {listing.is_authenticated && <AuthBadge />}
            <ConditionBadge condition={listing.condition} />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">{listing.title}</h1>
          <p className="text-gray-400 text-sm mb-4">{listing.model}</p>

          <p className="text-3xl font-bold text-gray-900 mb-6">{price}</p>

          {/* Actions */}
          <div className="flex gap-3 mb-8">
            {!isOwner && (
              <button className="flex-1 bg-gray-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
                Contact Seller
              </button>
            )}
            {user && !isOwner && (
              <button
                onClick={toggleSave}
                className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors ${
                  saved ? "border-red-200 bg-red-50" : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <svg
                  className={`w-5 h-5 ${saved ? "text-red-500 fill-red-500" : "text-gray-400"}`}
                  viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            )}
            {isOwner && (
              <Link href={`/sell/edit/${listing.id}`} className="flex-1 text-center border border-gray-200 py-3 rounded-xl text-sm font-medium hover:border-gray-900 transition-colors">
                Edit Listing
              </Link>
            )}
          </div>

          {/* Specs */}
          <div className="border border-gray-100 rounded-2xl divide-y divide-gray-100 mb-6">
            {specs.map((s) => (
              <div key={s.label} className="flex justify-between px-4 py-3">
                <span className="text-sm text-gray-500">{s.label}</span>
                <span className="text-sm font-medium text-gray-900 capitalize">{String(s.value)}</span>
              </div>
            ))}
          </div>

          {/* Description */}
          {listing.description && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{listing.description}</p>
            </div>
          )}

          {/* Seller */}
          <div className="border border-gray-100 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold uppercase">
              {listing.seller.username[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Link href={`/users/${listing.seller.id}`} className="text-sm font-semibold text-gray-900 hover:underline">
                  {listing.seller.full_name || listing.seller.username}
                </Link>
                {listing.seller.is_verified && <VerifiedBadge />}
              </div>
              <p className="text-xs text-gray-400 capitalize">{listing.seller.role}</p>
            </div>
            {(listing.location_city || listing.location_country) && (
              <p className="text-xs text-gray-400 ml-auto">
                {[listing.location_city, listing.location_country].filter(Boolean).join(", ")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
