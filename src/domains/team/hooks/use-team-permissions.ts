import { useMemo } from 'react'

import { useTeam } from '@/context/team-context'
import { useAuth } from '@/domains/auth/hooks/use-auth'
import { useTeamMembersQuery } from '@/domains/team/hooks/use-team-query'
import {
  canCreateConti as checkCanCreateConti,
  canEditTeamContent as checkCanEditTeamContent,
} from '@/domains/team/utils/team-permissions'

export function useTeamPermissions(teamId?: string | null) {
  const { user, isLoading: isAuthLoading } = useAuth()
  const { teams, selectedTeamId, isLoading: isTeamLoading } = useTeam()
  const resolvedTeamId = teamId ?? selectedTeamId ?? ''
  const {
    data: teamMembers = [],
    isLoading: isMembersLoading,
    isError,
  } = useTeamMembersQuery(resolvedTeamId)

  const currentMember = useMemo(() => {
    if (!user?.id) return undefined

    return teamMembers.find(
      (member) => String(member.userId) === String(user.id)
    )
  }, [teamMembers, user?.id])

  const isSelectingInitialTeam =
    teamId === undefined && !isTeamLoading && teams.length > 0 && !selectedTeamId
  const isLoading =
    isAuthLoading ||
    isTeamLoading ||
    isSelectingInitialTeam ||
    (!!resolvedTeamId && isMembersLoading)
  const role = currentMember?.role

  return {
    teamId: resolvedTeamId || null,
    currentMember,
    role,
    canCreateConti: checkCanCreateConti(role),
    canEditTeamContent: checkCanEditTeamContent(role),
    isLoading,
    isError,
  }
}
