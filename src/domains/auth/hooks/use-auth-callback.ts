import { useEffect } from 'react'
import { authKeys } from '@contee/query'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { refreshToken } from '@/domains/auth/api/auth.api'
import { useAuthStore } from '@/stores/auth-store'
import { UI_DELAY_MS } from '@/constants/ui-constants'

type AuthCallbackStatus = 'loading' | 'success' | 'error'

export function useAuthCallback() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()
  const { setAccessToken, setUser } = useAuthStore()

  const success = searchParams.get('success')
  const error = searchParams.get('error')
  const errorMessage = searchParams.get('message')
  const hasExplicitError = success === 'false' || !!error

  const refreshQuery = useQuery({
    queryKey: authKeys.callback({ success, error, message: errorMessage }),
    queryFn: refreshToken,
    enabled: !hasExplicitError,
    retry: false,
    staleTime: 0,
    gcTime: 0,
  })

  useEffect(() => {
    if (!refreshQuery.data?.accessToken) return

    setAccessToken(refreshQuery.data.accessToken)
    setUser(refreshQuery.data.user)
    queryClient.setQueriesData(
      { queryKey: authKeys.currentUser() },
      refreshQuery.data.user
    )
    const timer = setTimeout(() => {
      router.push('/dashboard/contis')
    }, UI_DELAY_MS.AUTH_CALLBACK_REDIRECT)

    return () => clearTimeout(timer)
  }, [queryClient, refreshQuery.data, router, setAccessToken, setUser])

  let status: AuthCallbackStatus = 'loading'
  let message = '인증 처리 중...'

  if (hasExplicitError) {
    status = 'error'
    message = errorMessage || '인증에 실패했습니다.'
  } else if (refreshQuery.isPending) {
    status = 'loading'
    message = '인증 처리 중...'
  } else if (refreshQuery.isError) {
    status = 'error'
    message = '인증 처리 중 오류가 발생했습니다.'
  } else if (refreshQuery.data) {
    status = 'success'
    message = '로그인에 성공했습니다!'
  } else {
    status = 'error'
    message = '토큰 갱신에 실패했습니다.'
  }

  return {
    status,
    message,
    handleGoToContis: () => router.push('/dashboard/contis'),
    handleRetry: () => router.push('/login'),
    handleGoHome: () => router.push('/'),
  }
}
