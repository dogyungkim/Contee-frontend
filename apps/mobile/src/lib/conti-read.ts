import { createContiReadRepository } from '@contee/api-client'
import { contiKeys, type ContiListKeyParams } from '@contee/query'
import { useQuery } from '@tanstack/react-query'

import apiClient from './api'

const contiReadRepository = createContiReadRepository(apiClient)

const DEFAULT_CONTI_LIST_PARAMS = {
  page: 0,
  size: 20,
} satisfies ContiListKeyParams

export function useMobileContis(teamId: string | null) {
  return useQuery({
    queryKey: contiKeys.list(teamId ?? '', DEFAULT_CONTI_LIST_PARAMS),
    queryFn: () =>
      contiReadRepository.listByTeam(teamId!, DEFAULT_CONTI_LIST_PARAMS),
    enabled: Boolean(teamId),
  })
}

export function useMobileContiDetail(contiId: string | null) {
  return useQuery({
    queryKey: contiKeys.detail(contiId ?? ''),
    queryFn: () => contiReadRepository.get(contiId!),
    enabled: Boolean(contiId),
  })
}

export function useMobileSharedConti(token: string | null) {
  return useQuery({
    queryKey: contiKeys.shared(token ?? ''),
    queryFn: () => contiReadRepository.getShared(token!),
    enabled: Boolean(token),
  })
}
