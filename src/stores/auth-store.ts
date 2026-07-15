import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/domains/auth/models/auth';

export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated' | 'unavailable';

interface AuthStore {
  accessToken: string | null;
  user: User | null;
  authStatus: AuthStatus;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasCheckedSession: boolean;
  sessionVersion: number;

  // Actions
  setAccessToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setUnavailable: (error?: string | null) => void;
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
      user: null,
      authStatus: 'checking',
      isAuthenticated: false,
      isLoading: true,
      error: null,
      hasCheckedSession: false,
      sessionVersion: 0,

      // Actions
      setAccessToken: (accessToken: string | null) => {
        set((state) => {
          const shouldRefreshUser =
            state.accessToken !== accessToken &&
            (!accessToken || !state.accessToken || !state.user);

          return {
            accessToken,
            user: accessToken ? state.user : null,
            authStatus: accessToken
              ? state.authStatus === 'authenticated' && state.user
                ? 'authenticated'
                : 'checking'
              : 'unauthenticated',
            isAuthenticated: !!accessToken && state.authStatus === 'authenticated' && !!state.user,
            isLoading: !!accessToken && state.authStatus !== 'authenticated',
            sessionVersion: shouldRefreshUser
              ? state.sessionVersion + 1
              : state.sessionVersion,
          };
        });
      },

      setUser: (user: User | null) => {
        set({
          user,
          authStatus: user ? 'authenticated' : 'unauthenticated',
          isAuthenticated: !!user,
          isLoading: false,
          error: null,
          hasCheckedSession: true,
        });
      },

      setUnavailable: (error: string | null = '서버에 연결할 수 없습니다.') => {
        set({
          user: null,
          authStatus: 'unavailable',
          isAuthenticated: false,
          isLoading: false,
          error,
          hasCheckedSession: true,
        });
      },

      setLoading: (isLoading: boolean) => {
        set((state) => (state.isLoading === isLoading ? state : { isLoading }));
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
        set((state) => ({
          accessToken: null,
          user: null,
          authStatus: 'unauthenticated',
          isAuthenticated: false,
          isLoading: false,
          error: null,
          hasCheckedSession: true,
          sessionVersion: state.sessionVersion + 1,
        }));
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
      }),
      merge: (persistedState, currentState) => {
        const persistedAuth = persistedState as Partial<AuthStore> | undefined;

        return {
          ...currentState,
          accessToken: persistedAuth?.accessToken ?? null,
          user: null,
          authStatus: 'checking',
          isAuthenticated: false,
          isLoading: true,
          error: null,
          hasCheckedSession: false,
        };
      },
    }
  )
);
