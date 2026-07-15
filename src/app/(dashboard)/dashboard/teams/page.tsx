'use client'

import { useMemo, useState } from 'react'

import { useTeam } from '@/context/team-context'
import { useAuth } from '@/domains/auth/hooks/use-auth'
import { TeamEmptyState } from '@/domains/team/components/team-empty-state'
import { TeamInfoCard } from '@/domains/team/components/team-info-card'
import { TeamMembersCard } from '@/domains/team/components/team-members-card'
import { TeamSettingsHeader } from '@/domains/team/components/team-settings-header'
import { useTeamMemberActions } from '@/domains/team/hooks/use-team-member-actions'
import { useTeamMembersQuery, useTeamQuery } from '@/domains/team/hooks/use-team-query'
import {
  filterTeamMembers,
  hasManageableTeamMembers,
  type MemberRoleFilter,
} from '@/domains/team/utils/team-member-filters'

export default function TeamsPage() {
  const { selectedTeam: summaryTeam, selectedTeamId } = useTeam()
  const { data: teamDetail } = useTeamQuery(selectedTeamId || '')
  const selectedTeam = teamDetail || summaryTeam
  const { user } = useAuth()
  const { data: members = [], isLoading: isMembersLoading } = useTeamMembersQuery(selectedTeamId || '')
  const [memberSearch, setMemberSearch] = useState('')
  const [memberRoleFilter, setMemberRoleFilter] = useState<MemberRoleFilter>('ALL')

  const {
    copiedCode,
    canManageMembers,
    handleCopyInviteCode,
    handleRemoveMember,
    handleChangeRole,
    getRoleLabel,
    getRoleBadgeVariant,
  } = useTeamMemberActions({
    selectedTeamId,
    selectedTeamShortCode: selectedTeam?.shortCode,
    members,
    currentUserId: user?.id,
  })

  const filteredMembers = useMemo(
    () => filterTeamMembers(members, memberSearch, memberRoleFilter),
    [memberRoleFilter, memberSearch, members],
  )
  const hasManageableMembers = canManageMembers && hasManageableTeamMembers(members, user?.id)

  if (!selectedTeam) {
    return <TeamEmptyState />
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <TeamSettingsHeader teamName={selectedTeam.name} />

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <TeamInfoCard
          team={selectedTeam}
          copiedCode={copiedCode}
          onCopyInviteCode={handleCopyInviteCode}
        />
        <TeamMembersCard
          members={members}
          filteredMembers={filteredMembers}
          isLoading={isMembersLoading}
          search={memberSearch}
          roleFilter={memberRoleFilter}
          canManageMembers={canManageMembers}
          hasManageableMembers={hasManageableMembers}
          currentUserId={user?.id}
          getRoleLabel={getRoleLabel}
          getRoleBadgeVariant={getRoleBadgeVariant}
          onSearchChange={setMemberSearch}
          onRoleFilterChange={setMemberRoleFilter}
          onChangeRole={handleChangeRole}
          onRemoveMember={handleRemoveMember}
        />
      </div>
    </div>
  )
}
