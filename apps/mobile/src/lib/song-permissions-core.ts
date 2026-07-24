import type { TeamMember } from '@contee/domain'

export function canEditSongs(
  currentUserId: string | null,
  members: readonly TeamMember[] | undefined
) {
  if (!currentUserId || !members) return false
  const role = members.find((member) => member.userId === currentUserId)?.role
  return role === 'OWNER' || role === 'ADMIN' || role === 'MEMBER'
}
