'use client';

import { useEffect } from 'react';
import axios from 'axios';
import { useUserQuery } from '@/domains/auth/hooks/use-auth-query';
import { useInitialAuth } from '@/domains/auth/hooks/use-auth';
import { useAuthStore } from '@/stores/auth-store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Check for existing session on initial load
  useInitialAuth();

  const hasCheckedSession = useAuthStore((state) => state.hasCheckedSession);
  const accessToken = useAuthStore((state) => state.accessToken);
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setUnavailable = useAuthStore((state) => state.setUnavailable);
  const reset = useAuthStore((state) => state.reset);

  const userQuery = useUserQuery(hasCheckedSession && !!accessToken);

  useEffect(() => {
    setLoading(!hasCheckedSession || userQuery.isLoading);
  }, [hasCheckedSession, setLoading, userQuery.isLoading]);

  useEffect(() => {
    if (userQuery.data === undefined) return;
    if (userQuery.data === null) {
      reset();
      return;
    }

    setUser(userQuery.data);
  }, [reset, setUser, userQuery.data]);

  useEffect(() => {
    if (!userQuery.error) return;

    if (axios.isAxiosError(userQuery.error)) {
      const status = userQuery.error.response?.status;
      if (status === 401 || status === 403) {
        reset();
        return;
      }
    }

    setUnavailable('서버에 연결할 수 없습니다.');
  }, [reset, setUnavailable, userQuery.error]);

  return <>{children}</>;
}
