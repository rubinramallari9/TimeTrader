import { api } from "./api";
import { ListingCard, ListingDetail, MyListing, CreateListingData, ListingFilters, PaginatedResponse, ListingImage, ListingPromotion, PromotionPlan } from "@/types";

export const listingsApi = {
  list: (filters: ListingFilters = {}) => {
    const params: Record<string, string | number | boolean> = {};
    if (filters.search) params.search = filters.search;
    if (filters.brand) params.brand = filters.brand;
    if (filters.min_price) params.min_price = filters.min_price;
    if (filters.max_price) params.max_price = filters.max_price;
    if (filters.city) params.city = filters.city;
    if (filters.country) params.country = filters.country;
    if (filters.sort) params.sort = filters.sort;
    if (filters.page) params.page = filters.page;
    if (filters.condition?.length) params.condition = filters.condition.join(",");
    if (filters.movement_type?.length) params.movement_type = filters.movement_type.join(",");
    return api.get<PaginatedResponse<ListingCard>>("/listings/", { params });
  },

  get: (id: string) =>
    api.get<ListingDetail>(`/listings/${id}/`),

  create: (data: CreateListingData) =>
    api.post<ListingDetail>("/listings/", data),

  update: (id: string, data: Partial<CreateListingData>) =>
    api.patch<ListingDetail>(`/listings/${id}/`, data),

  remove: (id: string) =>
    api.delete(`/listings/${id}/`),

  uploadImage: (id: string, file: File) => {
    const form = new FormData();
    form.append("image", file);
    return api.post<ListingImage>(`/listings/${id}/images/`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deleteImage: (listingId: string, imageId: string) =>
    api.delete(`/listings/${listingId}/images/${imageId}/`),

  save: (id: string) =>
    api.post<{ saved: boolean }>(`/listings/${id}/save/`),

  unsave: (id: string) =>
    api.delete<{ saved: boolean }>(`/listings/${id}/save/`),

  mine: (status?: string) => {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    return api.get<PaginatedResponse<MyListing>>("/listings/mine/", { params });
  },

  markAsSold: (id: string) =>
    api.patch<ListingDetail>(`/listings/${id}/`, { status: "sold" }),

  getSaved: (page = 1) =>
    api.get<PaginatedResponse<ListingCard>>("/listings/saved/", { params: { page } }),

  getPromotion: (id: string) =>
    api.get<ListingPromotion | null>(`/listings/${id}/promote/`),

  promote: (id: string, plan: PromotionPlan) =>
    api.post<ListingPromotion>(`/listings/${id}/promote/`, { plan }),
};
