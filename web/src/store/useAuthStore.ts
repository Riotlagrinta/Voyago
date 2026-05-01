"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: "passenger" | "company_admin" | "driver" | "super_admin";
  avatarUrl?: string | null;
  companyId?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("voyago-token", token);
        }
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("voyago-token");
        }
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (updatedUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
        })),
    }),
    {
      name: "voyago-auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
