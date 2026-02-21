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
      <div className="tt-card overflow-hidden">
        {is_featured && (
          <div className="bg-[#B09145] text-white text-[10px] font-semibold tracking-[0.12em] uppercase px-3 py-1.5 text-center">
            Featured
          </div>
        )}
        <div className="p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-[#F0EDE8] flex-shrink-0 overflow-hidden border border-[#EDE9E3]">
              {logo_url ? (
                <Image src={logo_url} alt={name} width={56} height={56} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl font-bold text-[#C8C0B0]">
                  {name[0]}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                <h3 className="font-semibold text-[#0E1520] truncate">{name}</h3>
                {is_verified && <VerifiedBadge />}
              </div>
              <p className="text-xs text-[#9E9585] truncate">
                {[city, country].filter(Boolean).join(", ")}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <StarRating rating={average_rating} count={review_count} />
            {meta && <span className="text-xs text-[#9E9585]">{meta}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
