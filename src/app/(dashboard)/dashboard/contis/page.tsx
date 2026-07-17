'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'

import { useTeam } from '@/context/team-context'
import { ContiList } from '@/domains/conti/components/conti-list'
import { useAuth } from '@/domains/auth/hooks/use-auth'
import { useTeamMembersQuery } from '@/domains/team/hooks/use-team-query'
import { canCreateConti } from '@/domains/team/utils/team-permissions'
import { Button } from '@/components/ui/button'

export default function ContisPage() {
  const { selectedTeamId, selectedTeam, isLoading } = useTeam()
  const { user } = useAuth()
  const { data: teamMembers = [], isLoading: isMembersLoading } =
    useTeamMembersQuery(selectedTeamId || '')
  const currentMember = user?.id
    ? teamMembers.find((member) => String(member.userId) === String(user.id))
    : undefined
  const canCreate = canCreateConti(currentMember?.role)

  if (isLoading || (selectedTeamId && isMembersLoading)) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center space-y-3 rounded-lg border border-dashed text-center">
        <p className="type-body-sm text-muted-foreground">
          팀 정보를 불러오는 중...
        </p>
      </div>
    )
  }

  if (!selectedTeamId) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center space-y-4 rounded-lg border border-dashed text-center">
        <p className="text-muted-foreground">선택된 팀이 없습니다.</p>
        <p className="type-body-sm text-muted-foreground">
          먼저 팀을 선택하거나 생성해주세요.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-caption-upper text-muted-foreground">
            Worship plans
          </div>
          <h1 className="type-page-title mt-2">콘티 목록</h1>
          <p className="type-page-description mt-2">
            {selectedTeam?.name} 팀의 예배 콘티를 관리합니다.
          </p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/dashboard/contis/new">
              <Plus className="mr-2 h-4 w-4" />새 콘티 만들기
            </Link>
          </Button>
        )}
      </div>

      <ContiList />
    </div>
  )
}
