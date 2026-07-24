import { createTeamRepository } from '@contee/api-client'
import { useMutation } from '@tanstack/react-query'

import apiClient from './api'
import { useNetworkStatus } from './query-client'
import { useTeamSelection } from './team-selection'

const teamRepository = createTeamRepository(apiClient)

export function useMobileTeamActions() {
  const { isNetworkAvailable } = useNetworkStatus()
  const { refreshTeams, selectTeam, teams } = useTeamSelection()

  const createTeam = useMutation({
    mutationFn: async ({
      name,
      description,
    }: {
      name: string
      description?: string
    }) => {
      if (!isNetworkAvailable) throw new Error('offline')
      return teamRepository.create({ name, description })
    },
    onSuccess: async (team) => {
      await refreshTeams()
      await selectTeam(team.id)
    },
  })

  const joinTeam = useMutation({
    mutationFn: async (shortCode: string) => {
      if (!isNetworkAvailable) throw new Error('offline')
      return teamRepository.join(shortCode)
    },
    onSuccess: async (_, shortCode) => {
      const previousTeamIds = new Set(teams.map((team) => team.id))
      const refreshedTeams = await refreshTeams()
      const normalizedCode = shortCode.toUpperCase()
      const joinedTeam =
        refreshedTeams.find((team) => !previousTeamIds.has(team.id)) ??
        refreshedTeams.find(
          (team) => team.shortCode?.toUpperCase() === normalizedCode
        )

      if (joinedTeam) await selectTeam(joinedTeam.id)
    },
  })

  return { createTeam, joinTeam, isNetworkAvailable }
}
