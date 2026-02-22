"use client";

import { create } from "zustand";
import { User, UserRole } from "@/types";
import { authApi, usersApi } from "@/lib/auth-api";
import { storeTokens, clearStoredTokens, getStoredTokens } from "@/lib/api";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  googleLogin: (idToken: string, role?: UserRole) => Promise<void>;
  fetchMe: () => Promise<void>;
  updateMe: (data: Partial<User>) => Promise<void>;
  initialize: () => Promise<void>;
}

type PublicRole = Exclude<UserRole, "admin">;

interface RegisterData {
  email: string;
  username: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
  role?: PublicRole;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    const tokens = getStoredTokens();
    if (!tokens?.access) {
      set({ isInitialized: true });
      return;
    }
    try {
      await get().fetchMe();
    } catch {
      // Tokens already cleared by the response interceptor if refresh failed.
      // Don't clear here to avoid wiping tokens on transient network errors.
    } finally {
      set({ isInitialized: true });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await authApi.login({ email, password });
      storeTokens({ access: data.access, refresh: data.refresh });
      set({ user: data.user });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const { data: res } = await authApi.register(data);
      storeTokens({ access: res.access, refresh: res.refresh });
      set({ user: res.user });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    const tokens = getStoredTokens();
    if (tokens?.refresh) {
      try {
        await authApi.logout(tokens.refresh);
      } catch {
        // Still clear locally even if server call fails
      }
    }
    clearStoredTokens();
    set({ user: null });
  },

  googleLogin: async (idToken, role) => {
    set({ isLoading: true });
    try {
      const { data } = await authApi.googleOAuth({ id_token: idToken, role });
      storeTokens({ access: data.access, refresh: data.refresh });
      set({ user: data.user });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMe: async () => {
    const { data } = await usersApi.getMe();
    set({ user: data });
  },

  updateMe: async (data) => {
    const { data: updated } = await usersApi.updateMe(data);
    set({ user: updated });
  },
}));
