"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ListingCard as ListingCardType } from "@/types";
import { ConditionBadge, AuthBadge } from "@/components/shared/Badge";
import { listingsApi } from "@/lib/listings-api";
import { useAuthStore } from "@/store/auth";

interface Props {
  listing: ListingCardType;
}

export default function ListingCard({ listing }: Props) {
  const { user } = useAuthStore();
  const [saved, setSaved] = useState(listing.is_saved);
  const [savingInProgress, setSavingInProgress] = useState(false);

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user || savingInProgress) return;
    setSavingInProgress(true);
    try {
      if (saved) {
        await listingsApi.unsave(listing.id);
        setSaved(false);
      } else {
        await listingsApi.save(listing.id);
        setSaved(true);
      }
    } catch {
      // silently fail
    } finally {
      setSavingInProgress(false);
    }
  };

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: listing.currency || "USD",
    maximumFractionDigits: 0,
  }).format(Number(listing.price));

  return (
    <Link href={`/listings/${listing.id}`} className="group block">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-gray-200 transition-all duration-200">
        {/* Image */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          {listing.primary_image ? (
            <Image
              src={listing.primary_image.url}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}

          {/* Save button */}
          {user && (
            <button
              onClick={toggleSave}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
              aria-label={saved ? "Remove from saved" : "Save listing"}
            >
              <svg
                className={`w-4 h-4 transition-colors ${saved ? "text-red-500 fill-red-500" : "text-gray-400"}`}
                viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}

          {/* Auth badge overlay */}
          {listing.is_authenticated && (
            <div className="absolute top-3 left-3">
              <AuthBadge />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide truncate">
              {listing.brand}
            </p>
            <ConditionBadge condition={listing.condition} />
          </div>

          <h3 className="font-semibold text-gray-900 text-sm leading-snug truncate mb-1">
            {listing.title}
          </h3>

          <p className="text-xs text-gray-400 truncate mb-3">
            {listing.model}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-gray-900">{formattedPrice}</span>
            {(listing.location_city || listing.location_country) && (
              <span className="text-xs text-gray-400 truncate">
                {[listing.location_city, listing.location_country].filter(Boolean).join(", ")}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
