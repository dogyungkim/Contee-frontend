import Link from 'next/link'

import { DashboardClient } from '@/components/features/dashboard/dashboard-client'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  // TODO: Replace with real team data fetching logic
  const mockHasTeam = false;

  return (
    <div className="pb-8">
      {mockHasTeam && (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">대시보드</h1>
            <p className="text-sm text-muted-foreground">
              최근 콘티와 활동을 한눈에 확인하고, 빠르게 작업을 시작하세요.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/dashboard/contis">새 콘티 만들기</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/songs">곡 추가/검색</Link>
            </Button>
          </div>
        </div>
      )}

      <DashboardClient />
    </div>
  )
}

