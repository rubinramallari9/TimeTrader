import { api } from "./api";
import { AuthResponse, User, UserRole } from "@/types";

export const authApi = {
  register: (data: {
    email: string;
    username: string;
    password: string;
    password_confirm: string;
    first_name?: string;
    last_name?: string;
    role?: Exclude<UserRole, "admin">;
  }) => api.post<AuthResponse>("/auth/register/", data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>("/auth/login/", data),

  logout: (refresh: string) =>
    api.post("/auth/logout/", { refresh }),

  googleOAuth: (data: { id_token: string; role?: UserRole }) =>
    api.post<AuthResponse>("/auth/oauth/google/", data),

  verifyEmail: (token: string) =>
    api.get(`/auth/verify-email/${token}/`),

  passwordResetRequest: (email: string) =>
    api.post("/auth/password/reset/", { email }),

  passwordResetConfirm: (data: { token: string; new_password: string; new_password_confirm: string }) =>
    api.post("/auth/password/confirm/", data),

  refreshToken: (refresh: string) =>
    api.post<{ access: string }>("/auth/token/refresh/", { refresh }),
};

export const usersApi = {
  getMe: () => api.get<User>("/users/me/"),

  updateMe: (data: Partial<Pick<User, "username" | "first_name" | "last_name" | "phone">>) =>
    api.patch<User>("/users/me/", data),

  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append("avatar", file);
    return api.post<User>("/users/me/avatar/", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  changePassword: (data: { current_password: string; new_password: string; new_password_confirm: string }) =>
    api.post("/users/me/password/", data),

  getPublicProfile: (userId: string) =>
    api.get<User>(`/users/${userId}/`),
};
