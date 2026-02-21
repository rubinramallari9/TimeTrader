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
