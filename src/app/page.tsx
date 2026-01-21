 'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import HeroSection from '@/components/sections/hero-section';
import ProblemSection from '@/components/sections/problem-section';
import FeatureSection from '@/components/sections/feature-section';
import CtaSection from '@/components/sections/cta-section';
import { useAuth } from '@/domains/auth/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // 로그인 상태 확인 완료 후 인증된 사용자는 대시보드로 리다이렉트
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // 로딩 중이거나 인증된 상태(리다이렉트 대기 중)일 때 로딩 화면 표시
  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{isAuthenticated ? '대시보드로 이동 중...' : '확인 중...'}</span>
        </div>
      </div>
    );
  }

  // 비로그인 상태: 소개 페이지 표시
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <FeatureSection />
      <CtaSection />
    </>
  );
}
