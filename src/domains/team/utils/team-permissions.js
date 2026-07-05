const CONTENT_EDITOR_ROLES = new Set(['OWNER', 'ADMIN', 'MEMBER'])

/**
 * @param {import('../models/team').TeamRole | null | undefined} role
 */
export function canEditTeamContent(role) {
  return role != null && CONTENT_EDITOR_ROLES.has(role)
}
