import { createTeamRepository } from '@contee/api-client'
import { teamKeys } from '@contee/query'
import { useQuery } from '@tanstack/react-query'

import apiClient from './api'

const teamRepository = createTeamRepository(apiClient)

export function useMobileTeamDetail(selectedTeamId: string | null) {
  return useQuery({
    queryKey: teamKeys.detail(selectedTeamId ?? ''),
    queryFn: () => teamRepository.get(selectedTeamId!),
    enabled: Boolean(selectedTeamId),
  })
}

export function useMobileTeamMembers(selectedTeamId: string | null) {
  return useQuery({
    queryKey: teamKeys.members(selectedTeamId ?? ''),
    queryFn: () => teamRepository.listMembers(selectedTeamId!),
    enabled: Boolean(selectedTeamId),
  })
}

export function useMobileTeamRead(selectedTeamId: string | null) {
  return {
    teamQuery: useMobileTeamDetail(selectedTeamId),
    membersQuery: useMobileTeamMembers(selectedTeamId),
  }
}
