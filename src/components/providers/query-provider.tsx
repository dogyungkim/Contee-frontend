'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';

const MAX_QUERY_RETRIES = 2;
const QUERY_STALE_TIME_MS = 5 * 60 * 1000;
const QUERY_GC_TIME_MS = 24 * 60 * 60 * 1000;

const isBrowserOffline = () =>
  typeof navigator !== 'undefined' && navigator.onLine === false;

const shouldRetryQuery = (failureCount: number, error: unknown) => {
  if (isBrowserOffline()) return false;

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401 || status === 403) return false;
  }

  return failureCount < MAX_QUERY_RETRIES;
};

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: shouldRetryQuery,
            staleTime: QUERY_STALE_TIME_MS,
            gcTime: QUERY_GC_TIME_MS,
            refetchOnReconnect: true,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
