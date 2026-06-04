import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthStore {
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasCheckedSession: boolean;

  // Actions
  setAccessToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHasCheckedSession: (checked: boolean) => void;
  clearError: () => void;
  reset: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Initial state
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      hasCheckedSession: false,

      // Actions
      setAccessToken: (accessToken: string | null) => {
        set({ accessToken, isAuthenticated: !!accessToken });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      setHasCheckedSession: (hasCheckedSession: boolean) => {
        set({ hasCheckedSession });
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set({
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          hasCheckedSession: true,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
