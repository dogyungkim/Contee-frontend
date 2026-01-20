'use client';

import { useUserQuery } from '@/hooks/queries/use-auth-query';
import { useInitialAuth } from '@/hooks/use-auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Check for existing session on initial load
  useInitialAuth();
  
  // Fetch user data when token is available
  useUserQuery();

  return <>{children}</>;
}
