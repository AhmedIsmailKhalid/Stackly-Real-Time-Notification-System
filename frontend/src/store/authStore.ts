import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types/user.types';

// ─────────────────────────────────────────
// STATE
// ─────────────────────────────────────────

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;

  // Actions
  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
  setInitializing: (value: boolean) => void;
}

// ─────────────────────────────────────────
// STORE
// ─────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isInitializing: true,

      setAuth: (user, accessToken) =>
        set({
          user,
          accessToken,
          isAuthenticated: true,
          isInitializing: false,
        }),

      setAccessToken: (accessToken) =>
        set({ accessToken }),

      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isInitializing: false,
        }),

      setInitializing: (value) =>
        set({ isInitializing: value }),
    }),
    {
      name: 'stackly-auth',
      storage: createJSONStorage(() => localStorage),
      // Only persist user — access token is intentionally kept in memory
      // and re-issued via refresh token cookie on page load
      partialize: (state) => ({ user: state.user }),
    }
  )
);