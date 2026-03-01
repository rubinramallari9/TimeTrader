import { api } from "./api";
import { RepairShopCard, RepairShopDetail, RepairService, RepairShowcase, Appointment, Review, PaginatedResponse } from "@/types";

export const repairsApi = {
  list: (params?: { search?: string; city?: string; country?: string; featured?: boolean; page?: number }) =>
    api.get<PaginatedResponse<RepairShopCard>>("/repairs/", { params }),

  get: (slug: string) =>
    api.get<RepairShopDetail>(`/repairs/${slug}/`),

  create: (data: Partial<RepairShopDetail>) =>
    api.post<RepairShopDetail>("/repairs/", data),

  update: (slug: string, data: Partial<RepairShopDetail>) =>
    api.patch<RepairShopDetail>(`/repairs/${slug}/`, data),

  getServices: (slug: string) =>
    api.get<RepairService[]>(`/repairs/${slug}/services/`),

  addService: (slug: string, data: Partial<RepairService>) =>
    api.post<RepairService>(`/repairs/${slug}/services/`, data),

  updateService: (slug: string, serviceId: string, data: Partial<RepairService>) =>
    api.patch<RepairService>(`/repairs/${slug}/services/${serviceId}/`, data),

  deleteService: (slug: string, serviceId: string) =>
    api.delete(`/repairs/${slug}/services/${serviceId}/`),

  bookAppointment: (slug: string, data: { service?: string; scheduled_at: string; notes?: string }) =>
    api.post<Appointment>(`/repairs/${slug}/appointments/`, data),

  getAppointments: (slug: string, page = 1) =>
    api.get<PaginatedResponse<Appointment>>(`/repairs/${slug}/appointments/`, { params: { page } }),

  updateAppointmentStatus: (slug: string, apptId: string, status: string) =>
    api.patch<Appointment>(`/repairs/${slug}/appointments/${apptId}/`, { status }),

  getReviews: (slug: string, page = 1) =>
    api.get<PaginatedResponse<Review>>(`/repairs/${slug}/reviews/`, { params: { page } }),

  postReview: (slug: string, data: { rating: number; content: string }) =>
    api.post<Review>(`/repairs/${slug}/reviews/`, data),

  mine: () =>
    api.get<RepairShopDetail>("/repairs/mine/"),

  getShowcase: (slug: string) =>
    api.get<RepairShowcase[]>(`/repairs/${slug}/showcase/`),

  getShowcaseItem: (slug: string, itemId: string) =>
    api.get<RepairShowcase>(`/repairs/${slug}/showcase/${itemId}/`),

  addShowcase: (slug: string, formData: FormData) =>
    api.post<RepairShowcase>(`/repairs/${slug}/showcase/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  deleteShowcase: (slug: string, itemId: string) =>
    api.delete(`/repairs/${slug}/showcase/${itemId}/`),

  uploadLogo: (file: File) => {
    const fd = new FormData();
    fd.append("logo", file);
    return api.post<RepairShopDetail>("/repairs/mine/logo/", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
