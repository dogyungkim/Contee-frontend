'use client'

import { AccountActionsCard } from '@/domains/auth/components/account-actions-card'
import { ProfileCard } from '@/domains/auth/components/profile-card'
import { useAuth } from '@/domains/auth/hooks/use-auth'

export default function SettingsPage() {
  const { user } = useAuth()

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div>
        <div className="text-caption-upper text-muted-foreground">Account settings</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">설정</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          프로필 정보와 계정 상태를 관리하세요.
        </p>
      </div>

      <ProfileCard user={user} />
      <AccountActionsCard />
    </div>
  )
}
