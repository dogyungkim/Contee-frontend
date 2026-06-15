import { useState } from 'react'
import { useRemoveTeamMemberMutation, useUpdateTeamMemberRoleMutation } from '@/domains/team/hooks/use-team-query'
import { useConfirmAction } from '@/hooks/use-confirm-action'
import { UI_DELAY_MS } from '@/constants/ui-constants'
import { toast } from '@/lib/toast'
import type { TeamMember, TeamRole } from '@/types/team'

const TEAM_ROLE_LABEL: Record<TeamRole, string> = {
  OWNER: '소유자',
  ADMIN: '관리자',
  MEMBER: '멤버',
  VIEWER: '뷰어',
}

type TeamRoleBadgeVariant = 'default' | 'secondary' | 'outline'

const TEAM_ROLE_BADGE_VARIANT: Record<TeamRole, TeamRoleBadgeVariant> = {
  OWNER: 'default',
  ADMIN: 'secondary',
  MEMBER: 'outline',
  VIEWER: 'outline',
}

interface UseTeamMemberActionsParams {
  selectedTeamId: string | null
  selectedTeamShortCode?: string
  members: TeamMember[]
  currentUserId?: string
}

export function useTeamMemberActions({
  selectedTeamId,
  selectedTeamShortCode,
  members,
  currentUserId,
}: UseTeamMemberActionsParams) {
  const { confirmAction } = useConfirmAction()
  const removeTeamMemberMutation = useRemoveTeamMemberMutation()
  const updateTeamMemberRoleMutation = useUpdateTeamMemberRoleMutation()
  const [copiedCode, setCopiedCode] = useState(false)

  const currentUserMember = members.find((member) => member.userId === currentUserId)
  const canManageMembers =
    currentUserMember?.role === 'OWNER' || currentUserMember?.role === 'ADMIN'

  const handleCopyInviteCode = async () => {
    if (!selectedTeamShortCode) return

    await navigator.clipboard.writeText(selectedTeamShortCode)
    setCopiedCode(true)
    toast.success('초대 코드가 복사되었습니다')
    setTimeout(() => setCopiedCode(false), UI_DELAY_MS.COPY_FEEDBACK_RESET)
  }

  const handleRemoveMember = async (userId: string, userName: string) => {
    if (!selectedTeamId) return

    const canRemove = await confirmAction(`${userName}님을 팀에서 내보내시겠습니까?`)
    if (!canRemove) return

    try {
      await removeTeamMemberMutation.mutateAsync({ teamId: selectedTeamId, userId })
      toast.success(`${userName}님이 팀에서 제거되었습니다`)
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        '멤버 제거에 실패했습니다'
      toast.error(errorMessage)
      console.error('Remove member error:', error)
    }
  }

  const handleChangeRole = async (userId: string, newRole: TeamRole, userName: string) => {
    if (!selectedTeamId) return

    try {
      await updateTeamMemberRoleMutation.mutateAsync({
        teamId: selectedTeamId,
        userId,
        role: { role: newRole },
      })
      toast.success(`${userName}님의 역할이 ${TEAM_ROLE_LABEL[newRole]}(으)로 변경되었습니다`)
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        '역할 변경에 실패했습니다'
      toast.error(errorMessage)
      console.error('Change role error:', error)
    }
  }

  return {
    copiedCode,
    canManageMembers,
    handleCopyInviteCode,
    handleRemoveMember,
    handleChangeRole,
    getRoleLabel: (role: TeamRole) => TEAM_ROLE_LABEL[role],
    getRoleBadgeVariant: (role: TeamRole) => TEAM_ROLE_BADGE_VARIANT[role],
  }
}
