import { api } from "./api";
import { StoreCard, StoreDetail, Review, PaginatedResponse } from "@/types";

export const storesApi = {
  list: (params?: { search?: string; city?: string; country?: string; featured?: boolean; page?: number }) =>
    api.get<PaginatedResponse<StoreCard>>("/stores/", { params }),

  get: (slug: string) =>
    api.get<StoreDetail>(`/stores/${slug}/`),

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

  getReviews: (slug: string, page = 1) =>
    api.get<PaginatedResponse<Review>>(`/stores/${slug}/reviews/`, { params: { page } }),

  postReview: (slug: string, data: { rating: number; content: string }) =>
    api.post<Review>(`/stores/${slug}/reviews/`, data),
};
