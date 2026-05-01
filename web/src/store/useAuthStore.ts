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

// Accès localStorage sécurisé (crash en navigation privée sur certains navigateurs)
function safeLocalStorage() {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        try {
          safeLocalStorage()?.setItem("voyago-token", token);
        } catch {
          // Navigation privée ou quota dépassé — on continue sans persister
        }
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        try {
          safeLocalStorage()?.removeItem("voyago-token");
        } catch {
          // Ignore
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
      storage: createJSONStorage(() => {
        // Fallback vers un storage en mémoire si localStorage inaccessible
        try {
          return localStorage;
        } catch {
          const memStore = new Map<string, string>();
          return {
            getItem: (k) => memStore.get(k) ?? null,
            setItem: (k, v) => memStore.set(k, v),
            removeItem: (k) => memStore.delete(k),
          };
        }
      }),
    }
  )
);
