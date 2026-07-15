'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { useAuth } from '@/domains/auth/hooks/use-auth'

function FullPageLoading({ label }: { label: string }) {
  return (
    <div className="min-h-[calc(100dvh-3.5rem)]">
      <div className="container flex items-center justify-center px-4 py-10 text-center sm:py-16">
        <div className="type-body-sm text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}

function FullPageUnavailable({ onGoHome }: { onGoHome: () => void }) {
  return (
    <div className="min-h-[calc(100dvh-3.5rem)]">
      <div className="container flex items-center justify-center px-4 py-10 text-center sm:py-16">
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-xl font-semibold tracking-normal text-foreground">
              서버에 연결할 수 없습니다
            </h1>
            <p className="type-body-sm text-muted-foreground">
              잠시 후 다시 시도해주세요.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
              onClick={() => window.location.reload()}
            >
              다시 시도
            </button>
            <button
              type="button"
              className="inline-flex h-10 items-center rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground"
              onClick={onGoHome}
            >
              홈으로
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { authStatus, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return

    if (authStatus === 'unauthenticated' && !isAuthenticated) {
      // 요구사항: 비로그인 사용자는 대시보드 접근 불가 → 메인으로 리다이렉트
      router.replace('/')
    }
  }, [authStatus, isAuthenticated, isLoading, router, pathname])

  if (isLoading) return <FullPageLoading label="인증 확인 중..." />
  if (authStatus === 'unavailable') {
    return <FullPageUnavailable onGoHome={() => router.replace('/')} />
  }
  if (!isAuthenticated) return <FullPageLoading label="메인으로 이동 중..." />

  return <>{children}</>
}
