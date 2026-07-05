'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/header';

export function ConditionalHeader() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  const isSharedConti = pathname?.startsWith('/share/');

  if (isDashboard || isSharedConti) {
    return null;
  }

  return <Header />;
}
