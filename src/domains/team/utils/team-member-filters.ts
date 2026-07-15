import type { TeamMember, TeamRole } from '@/types/team'

export type MemberRoleFilter = 'ALL' | TeamRole

export const MEMBER_ROLE_FILTERS: { value: MemberRoleFilter; label: string }[] = [
  { value: 'ALL', label: '모든 역할' },
  { value: 'OWNER', label: '소유자' },
  { value: 'ADMIN', label: '리더' },
  { value: 'MEMBER', label: '멤버' },
  { value: 'VIEWER', label: '뷰어' },
]

export function filterTeamMembers(
  members: TeamMember[],
  search: string,
  roleFilter: MemberRoleFilter,
) {
  const normalizedSearch = search.trim().toLowerCase()

  return members.filter((member) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      member.userName.toLowerCase().includes(normalizedSearch) ||
      member.userEmail.toLowerCase().includes(normalizedSearch)
    const matchesRole = roleFilter === 'ALL' || member.role === roleFilter

    return matchesSearch && matchesRole
  })
}

export function canManageTeamMember(member: TeamMember, currentUserId?: string | number) {
  return Boolean(currentUserId) && String(member.userId) !== String(currentUserId) && member.role !== 'OWNER'
}

export function hasManageableTeamMembers(members: TeamMember[], currentUserId?: string | number) {
  return members.some((member) => canManageTeamMember(member, currentUserId))
}
