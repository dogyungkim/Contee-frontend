'use client';

import { usePathname } from 'next/navigation';
import Footer from '@/components/layout/footer';

export function ConditionalFooter() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  const isSharedConti = pathname?.startsWith('/share/');

  if (isDashboard || isSharedConti) {
    return null;
  }

  return <Footer />;
}
