'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'

import { useTeam } from '@/context/team-context'
import { ContiList } from '@/domains/conti/components/conti-list'
import { Button } from '@/components/ui/button'

export default function ContisPage() {
  const { selectedTeamId, selectedTeam } = useTeam()

  if (!selectedTeamId) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center space-y-4 rounded-lg border border-dashed text-center">
        <p className="text-muted-foreground">선택된 팀이 없습니다.</p>
        <p className="text-sm text-muted-foreground">먼저 팀을 선택하거나 생성해주세요.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">콘티 목록</h1>
          <p className="text-sm text-muted-foreground">
            {selectedTeam?.name} 팀의 예배 콘티를 관리합니다.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/contis/new">
            <Plus className="mr-2 h-4 w-4" />
            새 콘티 만들기
          </Link>
        </Button>
      </div>

      <ContiList />
    </div>
  )
}

