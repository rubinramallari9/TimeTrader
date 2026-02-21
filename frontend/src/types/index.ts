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
