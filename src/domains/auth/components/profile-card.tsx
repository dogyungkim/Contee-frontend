'use client'

import { User } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { User as AuthUser } from '@/domains/auth/models/auth'

interface ProfileCardProps {
  user: AuthUser | null | undefined
}

const getProviderLabel = (provider?: string) => {
  if (!provider) return '로그인 정보 없음'

  const normalizedProvider = provider.toLowerCase()

  if (normalizedProvider === 'google') return 'Google 계정'

  return provider
}

export function ProfileCard({ user }: ProfileCardProps) {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-lg">내 프로필</CardTitle>
        <CardDescription>현재 로그인된 계정 정보입니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground">
            {user?.profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.profileImageUrl}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-6 w-6" />
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{user?.name || '사용자'}</p>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {user?.email || '이메일 정보 없음'}
            </p>
            <p className="mt-3 text-caption-upper text-muted-foreground">
              {getProviderLabel(user?.provider)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
