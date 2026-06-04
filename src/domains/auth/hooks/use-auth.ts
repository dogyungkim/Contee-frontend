import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useUserQuery, useLogoutMutation, useSessionRecoveryQuery } from './use-auth-query';
import { getGoogleLoginUrl } from '@/domains/auth/api/auth.api';

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

  const isLoading = !hasCheckedSession || isUserLoading || isFetching;

  useEffect(() => {
    // Only redirect if we are sure about the auth state (not loading)
    if (!isLoading && !isAuthenticated && redirectTo) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  const login = () => {
    window.location.href = getGoogleLoginUrl();
  };

  return {
    isAuthenticated,
    isLoading,
    user,
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

export function useRedirectIfAuthenticated(redirectTo: string = '/dashboard') {
  const { isAuthenticated, hasCheckedSession } = useAuthStore();
  const { isLoading: isUserLoading, isFetching } = useUserQuery();
  const router = useRouter();

  const isLoading = !hasCheckedSession || isUserLoading || isFetching;

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  return { isAuthenticated, isLoading };
}
