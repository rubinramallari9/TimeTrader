export type UserRole = "buyer" | "seller" | "store" | "repair" | "admin";

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  avatar_url: string;
  phone: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface PublicUser {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  phone: string;
  role: UserRole;
  is_verified: boolean;
  created_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface ApiError {
  error?: string;
  message?: string;
  fields?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ── Promotions ────────────────────────────────────────────

// Seller listing promotions
export type DurationKey = "1m" | "3m" | "6m";
export type AddonKey = "basic" | "extra" | "premium";
export type PromotionPlan = "1m" | "3m" | "6m";

export interface DurationPlan {
  key: DurationKey;
  label: string;
  months: number;
  days: number;
  price: number;
}

export interface AddonPlan {
  key: AddonKey;
  label: string;
  prices: Record<DurationKey, number>;
  perks: string[];
}

export const DURATION_PLANS: DurationPlan[] = [
  { key: "1m", label: "1 Month",  months: 1, days: 30,  price: 5  },
  { key: "3m", label: "3 Months", months: 3, days: 90,  price: 13 },
  { key: "6m", label: "6 Months", months: 6, days: 180, price: 24 },
];

export const ADDON_PLANS: AddonPlan[] = [
  {
    key: "basic",
    label: "Basic",
    prices: { "1m": 0, "3m": 0, "6m": 0 },
    perks: ["Standard listing placement", "Normal search visibility"],
  },
  {
    key: "extra",
    label: "Extra",
    prices: { "1m": 1, "3m": 2, "6m": 3 },
    perks: ["Highlighted listing card", "Homepage placement", "3-day homepage feature"],
  },
  {
    key: "premium",
    label: "Premium",
    prices: { "1m": 2, "3m": 4, "6m": 6 },
    perks: ["Pinned to top of search", "Priority placement everywhere", "Premium badge"],
  },
];


export interface ListingPromotion {
  id: string;
  plan: PromotionPlan;
  plan_label: string;
  started_at: string;
  expires_at: string;
  is_active: boolean;
  is_expired: boolean;
}

// ── Listings ──────────────────────────────────────────────

export type ListingCondition = "new" | "excellent" | "good" | "fair" | "poor";
export type MovementType = "automatic" | "manual" | "quartz" | "solar";
export type ListingStatus = "active" | "sold" | "pending" | "removed";

export interface ListingImage {
  id: string;
  url: string;
  is_primary: boolean;
  order: number;
}

export interface ListingCard {
  id: string;
  title: string;
  brand: string;
  model: string;
  condition: ListingCondition;
  price: string;
  currency: string;
  location_city: string;
  location_country: string;
  is_featured: boolean;
  primary_image: ListingImage | null;
  seller: PublicUser;
  is_saved: boolean;
  views_count: number;
  created_at: string;
}

export interface ListingDetail extends ListingCard {
  reference_number: string;
  year: number | null;
  movement_type: MovementType;
  case_material: string;
  case_diameter_mm: string | null;
  description: string;
  status: ListingStatus;
  featured_until: string | null;
  images: ListingImage[];
  updated_at: string;
}

export interface CreateListingData {
  title: string;
  brand: string;
  model: string;
  reference_number?: string;
  year?: number;
  condition: ListingCondition;
  movement_type?: MovementType;
  case_material?: string;
  case_diameter_mm?: number;
  price: number;
  currency: string;
  description?: string;
  location_city?: string;
  location_country?: string;
}

// ── Messaging ─────────────────────────────────────────────

export interface Message {
  id: string;
  sender: PublicUser;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  listing_id: string;
  listing_title: string;
  listing_brand: string;
  buyer: PublicUser;
  seller: PublicUser;
  last_message: { content: string; sender_id: string; created_at: string } | null;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationDetail extends Conversation {
  messages: Message[];
}

// ── Store Promotions ───────────────────────────────────────

export type StorePromotionPlan = "spotlight" | "featured" | "premium";

export interface StorePromotionPlanInfo {
  key: StorePromotionPlan;
  label: string;
  days: number;
  price: string;
  perks: string[];
}

export const STORE_PROMOTION_PLANS: StorePromotionPlanInfo[] = [
  {
    key: "spotlight",
    label: "1 Month",
    days: 30,
    price: "20",
    perks: ["Featured badge in directory", "Higher placement in search", "30-day duration"],
  },
  {
    key: "featured",
    label: "3 Months",
    days: 90,
    price: "55",
    perks: ["Top placement in directory", "Featured badge + homepage exposure", "Priority search ranking", "90-day duration"],
  },
  {
    key: "premium",
    label: "6 Months",
    days: 180,
    price: "100",
    perks: ["Maximum visibility in directory", "Homepage spotlight", "Priority badge everywhere", "180-day duration"],
  },
];

// Repair shop promotion plans
export type RepairPromotionPlan = "1m" | "3m" | "6m";

export interface RepairPromotionPlanInfo {
  key: RepairPromotionPlan;
  label: string;
  days: number;
  price: string;
  perks: string[];
}

export const REPAIR_PROMOTION_PLANS: RepairPromotionPlanInfo[] = [
  {
    key: "1m",
    label: "1 Month",
    days: 30,
    price: "10",
    perks: ["Listed in repair directory", "Shop profile highlighted", "30-day duration"],
  },
  {
    key: "3m",
    label: "3 Months",
    days: 90,
    price: "25",
    perks: ["Priority placement in search", "Featured badge on profile", "90-day duration"],
  },
  {
    key: "6m",
    label: "6 Months",
    days: 180,
    price: "45",
    perks: ["Top of directory listing", "Homepage exposure", "Priority badge", "180-day duration"],
  },
];

export interface StorePromotion {
  id: string;
  plan: StorePromotionPlan;
  plan_label: string;
  started_at: string;
  expires_at: string;
  is_active: boolean;
  is_expired: boolean;
}

export interface RepairPromotion {
  id: string;
  plan: RepairPromotionPlan;
  plan_label: string;
  started_at: string;
  expires_at: string;
  is_active: boolean;
  is_expired: boolean;
}

// ── Stores ────────────────────────────────────────────────

export interface StoreCard {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  city: string;
  country: string;
  is_featured: boolean;
  is_verified: boolean;
  average_rating: number;
  review_count: number;
}

export interface StoreDetail extends StoreCard {
  description: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  latitude: string | null;
  longitude: string | null;
  opening_hours: Record<string, string>;
  owner: PublicUser;
  images: { id: string; url: string; order: number }[];
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  author: PublicUser;
  rating: number;
  content: string;
  created_at: string;
}

// ── Repair Shops ──────────────────────────────────────────

export interface RepairService {
  id: string;
  name: string;
  description: string;
  price_from: string | null;
  price_to: string | null;
  duration_days: number | null;
  created_at: string;
}

export interface RepairShopCard {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  city: string;
  country: string;
  is_featured: boolean;
  is_verified: boolean;
  average_rating: number;
  review_count: number;
  service_count: number;
}

export interface RepairShopDetail extends RepairShopCard {
  description: string;
  phone: string;
  email: string;
  address: string;
  latitude: string | null;
  longitude: string | null;
  opening_hours: Record<string, string>;
  owner: PublicUser;
  services: RepairService[];
  created_at: string;
  updated_at: string;
}

export interface RepairShowcase {
  id: string;
  title: string;
  description: string;
  before_image_url: string;
  after_image_url: string | null;
  watch_brand: string;
  watch_model: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  shop: string;
  service: RepairService | null;
  customer: PublicUser;
  scheduled_at: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes: string;
  created_at: string;
}

export interface MyListing {
  id: string;
  title: string;
  brand: string;
  model: string;
  condition: ListingCondition;
  price: string;
  currency: string;
  status: ListingStatus;
  is_featured: boolean;
  views_count: number;
  primary_image: ListingImage | null;
  location_city: string;
  location_country: string;
  created_at: string;
  updated_at: string;
}

export interface ListingFilters {
  search?: string;
  brand?: string;
  condition?: ListingCondition[];
  movement_type?: MovementType[];
  min_price?: number;
  max_price?: number;
  city?: string;
  country?: string;
  sort?: string;
  page?: number;
}
