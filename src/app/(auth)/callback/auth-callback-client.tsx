'use client'

import { CheckCircle, Loader2, XCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthCallback } from '@/domains/auth/hooks/use-auth-callback'

export function AuthCallbackClient() {
  const { status, message, handleGoToContis, handleRetry, handleGoHome } = useAuthCallback()

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-50 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="w-full max-w-md">
        <Card className="rounded-2xl">
          <CardHeader className="px-4 text-center sm:px-5 lg:px-6">
            <div className="mx-auto mb-4">
              {status === 'loading' && <Loader2 className="h-12 w-12 animate-spin text-blue-600" />}
              {status === 'success' && <CheckCircle className="h-12 w-12 text-green-600" />}
              {status === 'error' && <XCircle className="h-12 w-12 text-red-600" />}
            </div>
            <CardTitle className="text-2xl">
              {status === 'loading' && '인증 처리 중'}
              {status === 'success' && '로그인 성공'}
              {status === 'error' && '로그인 실패'}
            </CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6">
            {status === 'loading' && (
              <div className="text-center">
                <p className="text-sm text-gray-600">잠시만 기다려주세요...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4 text-center">
                <p className="text-sm text-gray-600">콘티 리스트로 이동합니다.</p>
                <Button onClick={handleGoToContis} className="w-full">
                  콘티 리스트로 이동
                </Button>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4 text-center">
                <p className="text-sm text-red-600">다시 시도해주세요.</p>
                <div className="space-y-2">
                  <Button onClick={handleRetry} className="w-full">
                    다시 로그인
                  </Button>
                  <Button onClick={handleGoHome} variant="outline" className="w-full">
                    홈으로 이동
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">문제가 지속되면 고객지원에 문의해주세요.</p>
        </div>
      </div>
    </div>
  )
}
