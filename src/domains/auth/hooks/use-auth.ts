import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth-store';
import { useLogoutMutation, useSessionRecoveryQuery } from './use-auth-query';
import { getGoogleLoginUrl } from '@/domains/auth/api/auth.api';
import {
  DEV_AUTH_BYPASS_ENABLED,
  DEV_AUTH_BYPASS_TOKEN,
  DEV_AUTH_BYPASS_USER,
} from '@/domains/auth/dev-auth';

/**
 * [D] Logic Layer (Custom Hooks)
 * Role: Orchestrating TanStack Query and Zustand for UI consumption.
 */

/**
 * Initial authentication check - runs once on app load
 * Attempts to recover session from refresh token cookie
 */
export function useInitialAuth() {
  const {
    accessToken,
    setAccessToken,
    setUser,
    reset,
    hasCheckedSession,
    setHasCheckedSession,
    setLoading,
    setUnavailable,
  } = useAuthStore();
  const shouldRecoverSession = !hasCheckedSession && !accessToken;
  const sessionRecoveryQuery = useSessionRecoveryQuery(shouldRecoverSession);

  useEffect(() => {
    if (DEV_AUTH_BYPASS_ENABLED) {
      if (!accessToken) {
        setAccessToken(DEV_AUTH_BYPASS_TOKEN);
      }
      setUser(DEV_AUTH_BYPASS_USER);
      if (!hasCheckedSession) {
        setHasCheckedSession(true);
      }
      setLoading(false);
      return;
    }

    if (hasCheckedSession) return;

    if (accessToken) {
      setHasCheckedSession(true);
      return;
    }

    if (sessionRecoveryQuery.isPending) return;

    if (sessionRecoveryQuery.data?.accessToken) {
      setAccessToken(sessionRecoveryQuery.data.accessToken);
      setHasCheckedSession(true);
      return;
    }

    if (sessionRecoveryQuery.isError) {
      if (axios.isAxiosError(sessionRecoveryQuery.error)) {
        const status = sessionRecoveryQuery.error.response?.status;
        if (!status || status >= 500) {
          setUnavailable('서버에 연결할 수 없습니다.');
          return;
        }
      }

      reset();
      return;
    }

    reset();
  }, [
    accessToken,
    hasCheckedSession,
    setAccessToken,
    setUser,
    reset,
    setHasCheckedSession,
    setLoading,
    setUnavailable,
    sessionRecoveryQuery.data,
    sessionRecoveryQuery.error,
    sessionRecoveryQuery.isError,
    sessionRecoveryQuery.isPending,
  ]);

  return { hasChecked: hasCheckedSession };
}

export function useAuth(redirectTo?: string) {
  const { authStatus, isAuthenticated, isLoading, user, error, clearError } = useAuthStore();
  const logoutMutation = useLogoutMutation();
  const router = useRouter();

  const bypassedIsAuthenticated = DEV_AUTH_BYPASS_ENABLED ? true : isAuthenticated;
  const bypassedUser = DEV_AUTH_BYPASS_ENABLED ? DEV_AUTH_BYPASS_USER : user;
  const bypassedIsLoading = DEV_AUTH_BYPASS_ENABLED ? false : isLoading;
  const bypassedAuthStatus = DEV_AUTH_BYPASS_ENABLED ? 'authenticated' : authStatus;

  useEffect(() => {
    // Only redirect if we are sure about the auth state (not loading)
    if (
      !bypassedIsLoading &&
      bypassedAuthStatus === 'unauthenticated' &&
      !bypassedIsAuthenticated &&
      redirectTo
    ) {
      router.push(redirectTo);
    }
  }, [bypassedAuthStatus, bypassedIsAuthenticated, bypassedIsLoading, redirectTo, router]);

  const login = () => {
    if (DEV_AUTH_BYPASS_ENABLED) return;
    window.location.href = getGoogleLoginUrl();
  };

  return {
    authStatus: bypassedAuthStatus,
    isAuthenticated: bypassedIsAuthenticated,
    isLoading: bypassedIsLoading,
    user: bypassedUser,
    error,
    clearError,
    login,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}

export function useRequireAuth(redirectTo: string = '/login') {
  return useAuth(redirectTo);
}

export function useRedirectIfAuthenticated(redirectTo: string = '/dashboard/contis') {
  const { authStatus, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  const bypassedIsAuthenticated = DEV_AUTH_BYPASS_ENABLED ? true : isAuthenticated;
  const bypassedIsLoading = DEV_AUTH_BYPASS_ENABLED ? false : isLoading;
  const bypassedAuthStatus = DEV_AUTH_BYPASS_ENABLED ? 'authenticated' : authStatus;

  useEffect(() => {
    if (!bypassedIsLoading && bypassedAuthStatus === 'authenticated' && bypassedIsAuthenticated) {
      router.push(redirectTo);
    }
  }, [bypassedAuthStatus, bypassedIsAuthenticated, bypassedIsLoading, redirectTo, router]);

  return {
    authStatus: bypassedAuthStatus,
    isAuthenticated: bypassedIsAuthenticated,
    isLoading: bypassedIsLoading,
  };
}
