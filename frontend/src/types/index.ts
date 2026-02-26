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

export type PromotionPlan = "basic" | "featured" | "premium";

export interface PromotionPlanInfo {
  key: PromotionPlan;
  label: string;
  days: number;
  price: string;
  perks: string[];
}

export const PROMOTION_PLANS: PromotionPlanInfo[] = [
  {
    key: "basic",
    label: "Basic Boost",
    days: 7,
    price: "9.99",
    perks: ["Highlighted in search results", "Featured badge on listing", "7-day duration"],
  },
  {
    key: "featured",
    label: "Featured",
    days: 30,
    price: "24.99",
    perks: ["Top placement in search", "Featured badge", "Listed in Featured section", "30-day duration"],
  },
  {
    key: "premium",
    label: "Premium",
    days: 90,
    price: "49.99",
    perks: ["Homepage spotlight", "Priority search placement", "Premium badge", "Social media feature", "90-day duration"],
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
  is_authenticated: boolean;
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

export interface ListingFilters {
  search?: string;
  brand?: string;
  condition?: ListingCondition[];
  movement_type?: MovementType[];
  min_price?: number;
  max_price?: number;
  city?: string;
  country?: string;
  is_authenticated?: boolean;
  sort?: string;
  page?: number;
}
