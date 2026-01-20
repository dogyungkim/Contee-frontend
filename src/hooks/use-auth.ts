import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useUserQuery, useLogoutMutation } from './queries/use-auth-query';
import { loginWithGoogle, refreshToken } from '@/lib/api/auth';

/**
 * [D] Logic Layer (Custom Hooks)
 * Role: Orchestrating TanStack Query and Zustand for UI consumption.
 */

/**
 * Initial authentication check - runs once on app load
 * Attempts to recover session from refresh token cookie
 */
export function useInitialAuth() {
  const { accessToken, setAccessToken } = useAuthStore();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      // Only check once and only if no token exists
      if (hasChecked || accessToken) return;

      try {
        console.log('[useInitialAuth] Checking for existing session...');
        const refreshData = await refreshToken();
        if (refreshData.success && refreshData.data) {
          console.log('[useInitialAuth] Session recovered');
          setAccessToken(refreshData.data.accessToken);
        }
      } catch (error) {
        // Silent fail - no session to recover
        console.log('[useInitialAuth] No session to recover');
      } finally {
        setHasChecked(true);
      }
    };

    checkSession();
  }, [accessToken, setAccessToken, hasChecked]);

  return { hasChecked };
}

export function useAuth(redirectTo?: string) {
  const { isAuthenticated, error, clearError } = useAuthStore();
  const { data: user, isLoading: isUserLoading, isFetching } = useUserQuery();
  const logoutMutation = useLogoutMutation();
  const router = useRouter();

  const isLoading = isUserLoading || isFetching;

  useEffect(() => {
    // Only redirect if we are sure about the auth state (not loading)
    if (!isLoading && !isAuthenticated && redirectTo) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  return {
    isAuthenticated,
    isLoading,
    user,
    error,
    clearError,
    login: loginWithGoogle,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}

export function useRequireAuth(redirectTo: string = '/login') {
  return useAuth(redirectTo);
}

export function useRedirectIfAuthenticated(redirectTo: string = '/dashboard') {
  const { isAuthenticated } = useAuthStore();
  const { isLoading: isUserLoading, isFetching } = useUserQuery();
  const router = useRouter();

  const isLoading = isUserLoading || isFetching;

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  return { isAuthenticated, isLoading };
}

