import type { Conti, TeamMember } from '@contee/domain'

export interface ContiPermissions {
  isResolved: boolean
  canEdit: boolean
  canDelete: boolean
  canPublish: boolean
}

export function getContiPermissions({
  conti,
  currentUserId,
  members,
}: {
  conti: Conti
  currentUserId: string | null
  members: readonly TeamMember[] | undefined
}): ContiPermissions {
  if (!currentUserId || !members) {
    return {
      isResolved: false,
      canEdit: false,
      canDelete: false,
      canPublish: false,
    }
  }

  const role = members.find((member) => member.userId === currentUserId)?.role
  const canEdit = role === 'OWNER' || role === 'ADMIN' || role === 'MEMBER'

  return {
    isResolved: true,
    canEdit,
    canDelete: canEdit,
    canPublish:
      canEdit &&
      conti.status === 'DRAFT' &&
      conti.createdById === currentUserId,
  }
}
