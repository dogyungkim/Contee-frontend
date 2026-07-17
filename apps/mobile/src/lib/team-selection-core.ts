export interface TeamSelectionCandidate {
  id: string
}

function normalizePersistedTeamId(teamId: string | null | undefined) {
  if (!teamId) return null

  const trimmedTeamId = teamId.trim()
  return trimmedTeamId.length > 0 ? trimmedTeamId : null
}

export function resolveSelectedTeamId<Team extends TeamSelectionCandidate>(
  teams: readonly Team[],
  persistedSelectedTeamId: string | null | undefined
) {
  if (teams.length === 0) return null

  const normalizedPersistedTeamId = normalizePersistedTeamId(
    persistedSelectedTeamId
  )

  if (
    normalizedPersistedTeamId &&
    teams.some((team) => team.id === normalizedPersistedTeamId)
  ) {
    return normalizedPersistedTeamId
  }

  return teams[0]?.id ?? null
}
