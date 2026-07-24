import { createContiReadRepository } from '@contee/api-client'
import type { ContiSearchParamsDto } from '@contee/domain'
import { contiKeys } from '@contee/query'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'

import apiClient from './api'
import {
  CONTI_PAGE_SIZE,
  getNextContiPage,
  normalizeContiFilters,
} from './conti-list-core'

const contiReadRepository = createContiReadRepository(apiClient)

export function useMobileContis(
  teamId: string | null,
  filters: Pick<ContiSearchParamsDto, 'q' | 'from' | 'to'> = {}
) {
  const params = { ...normalizeContiFilters(filters), size: CONTI_PAGE_SIZE }

  return useInfiniteQuery({
    queryKey: contiKeys.list(teamId ?? '', params),
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      contiReadRepository.listByTeam(teamId!, { ...params, page: pageParam }),
    getNextPageParam: getNextContiPage,
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
