import { songKeys } from '@contee/query'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createTeamSong,
  deleteTeamSong,
  getTeamSongs,
  updateTeamSongFavorite,
  updateTeamSong,
} from '@/domains/song/api/song.api'
import { getSongForm, updateSongForm } from '@/lib/api/song-form'
import {
  CreateTeamSongRequest,
  SongFormUpdateRequest,
  UpdateTeamSongRequest,
} from '@/types/song'

export { songKeys }

export const useTeamSongs = (teamId: string | null) => {
  return useQuery({
    queryKey: songKeys.list(teamId || ''),
    queryFn: () => getTeamSongs(teamId!),
    enabled: !!teamId,
  })
}

export const useSongForm = (teamId: string | null, songId: string | null) => {
  return useQuery({
    queryKey: songKeys.form(teamId || '', songId || ''),
    queryFn: () => getSongForm(teamId!, songId!),
    enabled: !!teamId && !!songId,
  })
}

export const useCreateTeamSong = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      teamId,
      request,
    }: {
      teamId: string
      request: CreateTeamSongRequest
    }) => createTeamSong(teamId, request),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: songKeys.list(teamId) })
    },
  })
}

export const useUpdateTeamSong = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      teamId,
      songId,
      request,
    }: {
      teamId: string
      songId: string
      request: UpdateTeamSongRequest
    }) => updateTeamSong(teamId, songId, request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: songKeys.list(data.teamId) })
    },
  })
}

export const useUpdateTeamSongFavorite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      teamId,
      songId,
      isFavorite,
    }: {
      teamId: string
      songId: string
      isFavorite: boolean
    }) => updateTeamSongFavorite(teamId, songId, isFavorite),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: songKeys.list(data.teamId) })
    },
  })
}

export const useUpdateSongForm = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      teamId,
      songId,
      request,
    }: {
      teamId: string
      songId: string
      request: SongFormUpdateRequest
    }) => updateSongForm(teamId, songId, request),
    onSuccess: (_, { teamId, songId }) => {
      queryClient.invalidateQueries({ queryKey: songKeys.form(teamId, songId) })
    },
  })
}

export const useDeleteTeamSong = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ teamId, songId }: { teamId: string; songId: string }) =>
      deleteTeamSong(teamId, songId),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: songKeys.list(teamId) })
    },
  })
}
