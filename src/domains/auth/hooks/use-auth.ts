import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useUserQuery, useLogoutMutation, useSessionRecoveryQuery } from './use-auth-query';
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
  const { accessToken, setAccessToken, hasCheckedSession, setHasCheckedSession } = useAuthStore();
  const shouldRecoverSession = !hasCheckedSession && !accessToken;
  const sessionRecoveryQuery = useSessionRecoveryQuery(shouldRecoverSession);

  useEffect(() => {
    if (DEV_AUTH_BYPASS_ENABLED) {
      if (!accessToken) {
        setAccessToken(DEV_AUTH_BYPASS_TOKEN);
      }
      if (!hasCheckedSession) {
        setHasCheckedSession(true);
      }
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
    }

    setHasCheckedSession(true);
  }, [
    accessToken,
    hasCheckedSession,
    setAccessToken,
    setHasCheckedSession,
    sessionRecoveryQuery.data,
    sessionRecoveryQuery.isPending,
  ]);

  return { hasChecked: hasCheckedSession };
}

export function useAuth(redirectTo?: string) {
  const { isAuthenticated, error, clearError, hasCheckedSession } = useAuthStore();
  const { data: user, isLoading: isUserLoading, isFetching } = useUserQuery();
  const logoutMutation = useLogoutMutation();
  const router = useRouter();

  const bypassedIsAuthenticated = DEV_AUTH_BYPASS_ENABLED ? true : isAuthenticated;
  const bypassedUser = DEV_AUTH_BYPASS_ENABLED ? DEV_AUTH_BYPASS_USER : user;
  const isLoading = DEV_AUTH_BYPASS_ENABLED ? false : !hasCheckedSession || isUserLoading || isFetching;

  useEffect(() => {
    // Only redirect if we are sure about the auth state (not loading)
    if (!isLoading && !bypassedIsAuthenticated && redirectTo) {
      router.push(redirectTo);
    }
  }, [bypassedIsAuthenticated, isLoading, redirectTo, router]);

  const login = () => {
    if (DEV_AUTH_BYPASS_ENABLED) return;
    window.location.href = getGoogleLoginUrl();
  };

  return {
    isAuthenticated: bypassedIsAuthenticated,
    isLoading,
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
  const { isAuthenticated, hasCheckedSession } = useAuthStore();
  const { isLoading: isUserLoading, isFetching } = useUserQuery();
  const router = useRouter();

  const bypassedIsAuthenticated = DEV_AUTH_BYPASS_ENABLED ? true : isAuthenticated;
  const isLoading = DEV_AUTH_BYPASS_ENABLED ? false : !hasCheckedSession || isUserLoading || isFetching;

  useEffect(() => {
    if (!isLoading && bypassedIsAuthenticated) {
      router.push(redirectTo);
    }
  }, [bypassedIsAuthenticated, isLoading, redirectTo, router]);

  return { isAuthenticated: bypassedIsAuthenticated, isLoading };
}
