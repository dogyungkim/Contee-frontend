 'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import HeroSection from '@/components/sections/hero-section';
import FeatureSection from '@/components/sections/feature-section';
import CtaSection from '@/components/sections/cta-section';
import { useAuth } from '@/domains/auth/hooks/use-auth';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // 로그인 상태 확인 완료 후 인증된 사용자는 콘티 리스트로 리다이렉트
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard/contis');
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <>
      <HeroSection />
      <FeatureSection />
      <CtaSection />
    </>
  );
}
