 'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import HeroSection from '@/components/sections/hero-section';
import ProblemSection from '@/components/sections/problem-section';
import FeatureSection from '@/components/sections/feature-section';
import CtaSection from '@/components/sections/cta-section';
import { useAuthStore } from '@/stores/auth-store';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // 초기 로딩 또는 리다이렉트 시 UI 깜빡임을 줄이기 위해 로딩 화면을 먼저 표시
  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>확인 중...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <HeroSection />
      <ProblemSection />
      <FeatureSection />
      <CtaSection />
    </>
  );
}
