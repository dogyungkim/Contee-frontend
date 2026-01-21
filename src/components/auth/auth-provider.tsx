'use client';

import { useUserQuery } from '@/domains/auth/hooks/use-auth-query';
import { useInitialAuth } from '@/domains/auth/hooks/use-auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Check for existing session on initial load
  useInitialAuth();
  
  // Fetch user data when token is available
  useUserQuery();

  return <>{children}</>;
}
