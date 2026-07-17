const CONTENT_EDITOR_ROLES = new Set(['OWNER', 'ADMIN', 'MEMBER'])
const CONTI_CREATOR_ROLES = new Set(['OWNER', 'ADMIN'])

/**
 * @param {import('../models/team').TeamRole | null | undefined} role
 */
export function canEditTeamContent(role) {
  return role != null && CONTENT_EDITOR_ROLES.has(role)
}

/**
 * @param {import('../models/team').TeamRole | null | undefined} role
 */
export function canCreateConti(role) {
  return role != null && CONTI_CREATOR_ROLES.has(role)
}
