import Link from "next/link";
import Image from "next/image";
import StarRating from "./StarRating";
import { VerifiedBadge } from "./Badge";

interface Props {
  href: string;
  name: string;
  logo_url: string | null;
  city: string;
  country: string;
  is_verified: boolean;
  is_featured: boolean;
  average_rating: number;
  review_count: number;
  meta?: string; // e.g. "4 services" for repair shops
}

export default function DirectoryCard({
  href, name, logo_url, city, country,
  is_verified, is_featured, average_rating, review_count, meta,
}: Props) {
  return (
    <Link href={href} className="group block">
      <div className={`bg-white rounded-2xl border overflow-hidden hover:shadow-md transition-all duration-200 ${is_featured ? "border-amber-200" : "border-gray-100 hover:border-gray-200"}`}>
        {is_featured && (
          <div className="bg-amber-50 text-amber-700 text-xs font-medium px-3 py-1 text-center">
            Featured
          </div>
        )}
        <div className="p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
              {logo_url ? (
                <Image src={logo_url} alt={name} width={56} height={56} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-300">
                  {name[0]}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
                {is_verified && <VerifiedBadge />}
              </div>
              <p className="text-xs text-gray-400 truncate">
                {[city, country].filter(Boolean).join(", ")}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <StarRating rating={average_rating} count={review_count} />
            {meta && <span className="text-xs text-gray-400">{meta}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
