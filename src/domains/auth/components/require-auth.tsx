'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { useAuth } from '@/domains/auth/hooks/use-auth'

function FullPageLoading({ label }: { label: string }) {
  return (
    <div className="min-h-[calc(100dvh-3.5rem)]">
      <div className="container flex items-center justify-center py-16">
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      // 요구사항: 비로그인 사용자는 대시보드 접근 불가 → 메인으로 리다이렉트
      router.replace('/')
    }
  }, [isAuthenticated, isLoading, router, pathname])

  if (isLoading) return <FullPageLoading label="인증 확인 중..." />
  if (!isAuthenticated) return <FullPageLoading label="메인으로 이동 중..." />

  return <>{children}</>
}

