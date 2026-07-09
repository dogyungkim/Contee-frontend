'use client'

import Link from 'next/link'
import { Info, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/domains/auth/hooks/use-auth'
import { useContiDetail } from '@/domains/conti/hooks/use-conti'
import { useContiPageMode } from '@/domains/conti/hooks/use-conti-page-mode'
import { useTeamMembersQuery } from '@/domains/team/hooks/use-team-query'
import { useTeam } from '@/context/team-context'
import { ContiDetailView } from './conti-detail-view'
import { ContiEditContainer } from './conti-edit-container'

interface ContiDetailContainerProps {
  contiId: string
}

export function ContiDetailContainer({ contiId }: ContiDetailContainerProps) {
  const { selectedTeamId } = useTeam()
  const { user } = useAuth()
  const { data: conti, isLoading: isContiLoading } = useContiDetail(contiId)
  const permissionTeamId = conti?.teamId || selectedTeamId || ''
  const { data: teamMembers = [], isLoading: isMembersLoading } =
    useTeamMembersQuery(permissionTeamId)
  const currentMember = teamMembers.find((member) => member.userId === String(user?.id))
  const canEdit =
    currentMember?.role === 'OWNER' ||
    currentMember?.role === 'ADMIN' ||
    currentMember?.role === 'MEMBER'
  const canManageExternalShare =
    currentMember?.role === 'OWNER' ||
    currentMember?.role === 'ADMIN'
  const canPublish =
    conti?.status === 'DRAFT' &&
    conti?.createdById === String(user?.id) &&
    canEdit
  const pageMode = useContiPageMode(canEdit)

  if (isContiLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
        <p className="text-sm font-medium">콘티 정보를 불러오는 중...</p>
      </div>
    )
  }

  if (!conti) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/5">
        <Info className="mb-2 h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm font-medium text-muted-foreground">콘티를 찾을 수 없습니다.</p>
        <Button variant="link" asChild className="mt-2">
          <Link href="/dashboard/contis">목록으로 돌아가기</Link>
        </Button>
      </div>
    )
  }

  if (pageMode.mode === 'edit') {
    return (
      <ContiEditContainer
        key={conti.id}
        conti={conti}
        permissionTeamId={permissionTeamId}
        canManageExternalShare={canManageExternalShare}
        onClose={pageMode.closeEditor}
      />
    )
  }

  return (
    <ContiDetailView
      conti={conti}
      canEdit={canEdit}
      canPublish={canPublish}
      canManageExternalShare={canManageExternalShare}
      isMembersLoading={isMembersLoading}
      onStartEdit={pageMode.startEditing}
    />
  )
}
