import { createSongRepository } from '@contee/api-client'
import type {
  CreateTeamSongRequestDto,
  SongFormUpdateRequestDto,
  UpdateTeamSongRequestDto,
} from '@contee/domain'
import { songKeys } from '@contee/query'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import apiClient from './api'

const songRepository = createSongRepository(apiClient)

export function useMobileCreateSong() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      teamId,
      request,
    }: {
      teamId: string
      request: CreateTeamSongRequestDto
    }) => songRepository.create(teamId, request),
    onSuccess: (_, { teamId }) =>
      queryClient.invalidateQueries({ queryKey: songKeys.list(teamId) }),
  })
}

export function useMobileUpdateSong() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      teamId,
      songId,
      request,
    }: {
      teamId: string
      songId: string
      request: UpdateTeamSongRequestDto
    }) => songRepository.update(teamId, songId, request),
    onSuccess: (_, { teamId }) =>
      queryClient.invalidateQueries({ queryKey: songKeys.list(teamId) }),
  })
}

export function useMobileSongForm(
  teamId: string | null,
  songId: string | null
) {
  return useQuery({
    queryKey: songKeys.form(teamId ?? '', songId ?? ''),
    queryFn: () => songRepository.getForm(teamId!, songId!),
    enabled: Boolean(teamId && songId),
  })
}

export function useMobileUpdateSongForm() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      teamId,
      songId,
      request,
    }: {
      teamId: string
      songId: string
      request: SongFormUpdateRequestDto
    }) => songRepository.updateForm(teamId, songId, request),
    onSuccess: (_, { teamId, songId }) => {
      queryClient.removeQueries({ queryKey: songKeys.form(teamId, songId) })
      return queryClient.invalidateQueries({ queryKey: songKeys.list(teamId) })
    },
  })
}
