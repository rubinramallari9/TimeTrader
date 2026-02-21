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
  stripe_customer_id: string;
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
