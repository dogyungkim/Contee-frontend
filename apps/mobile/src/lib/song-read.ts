import { createSongReadRepository } from '@contee/api-client'
import type { TeamSongSearchParamsDto } from '@contee/domain'
import { songKeys } from '@contee/query'
import { useQuery } from '@tanstack/react-query'

import apiClient from './api'

const songReadRepository = createSongReadRepository(apiClient)

const DEFAULT_SONG_LIST_PARAMS = {
  page: 0,
  size: 50,
} satisfies TeamSongSearchParamsDto

export function useMobileSongs(teamId: string | null) {
  return useQuery({
    queryKey: songKeys.list(teamId ?? ''),
    queryFn: () =>
      songReadRepository.listByTeam(teamId!, DEFAULT_SONG_LIST_PARAMS),
    enabled: Boolean(teamId),
  })
}
