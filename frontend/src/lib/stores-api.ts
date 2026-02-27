import { api } from "./api";
import { StoreCard, StoreDetail, StorePromotion, StorePromotionPlan, Review, PaginatedResponse, ListingCard } from "@/types";

export const storesApi = {
  list: (params?: { search?: string; city?: string; country?: string; featured?: boolean; page?: number }) =>
    api.get<PaginatedResponse<StoreCard>>("/stores/", { params }),

  get: (slug: string) =>
    api.get<StoreDetail>(`/stores/${slug}/`),

  mine: () =>
    api.get<StoreDetail>("/stores/mine/"),

  create: (data: Partial<StoreDetail>) =>
    api.post<StoreDetail>("/stores/", data),

  update: (slug: string, data: Partial<StoreDetail>) =>
    api.patch<StoreDetail>(`/stores/${slug}/`, data),

  uploadLogo: (slug: string, file: File) => {
    const form = new FormData();
    form.append("logo", file);
    return api.post<StoreDetail>(`/stores/${slug}/logo/`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getListings: (slug: string, page = 1) =>
    api.get<PaginatedResponse<ListingCard>>(`/stores/${slug}/listings/`, { params: { page } }),

  getPromotion: (slug: string) =>
    api.get<StorePromotion | null>(`/stores/${slug}/promote/`),

  promote: (slug: string, plan: StorePromotionPlan) =>
    api.post<StorePromotion>(`/stores/${slug}/promote/`, { plan }),

  getReviews: (slug: string, page = 1) =>
    api.get<PaginatedResponse<Review>>(`/stores/${slug}/reviews/`, { params: { page } }),

  postReview: (slug: string, data: { rating: number; content: string }) =>
    api.post<Review>(`/stores/${slug}/reviews/`, data),
};
