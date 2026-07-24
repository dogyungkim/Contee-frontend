import type { AxiosInstance } from 'axios'
import type {
  ApiResponse,
  CreateTeamSongRequestDto,
  SongFormResponseDto,
  SongFormUpdateRequestDto,
  TeamSong,
  TeamSongResponseDto,
  UpdateTeamSongRequestDto,
} from '@contee/domain'
import { toTeamSongModel } from '@contee/domain'

import { createSongReadRepository } from './song-read.repository'

export function createSongRepository(client: AxiosInstance) {
  return {
    ...createSongReadRepository(client),
    create: async (
      teamId: string,
      request: CreateTeamSongRequestDto
    ): Promise<TeamSong> => {
      const { data } = await client.post<ApiResponse<TeamSongResponseDto>>(
        `/api/v1/teams/${teamId}/songs`,
        request
      )
      return toTeamSongModel(data.data)
    },
    update: async (
      teamId: string,
      songId: string,
      request: UpdateTeamSongRequestDto
    ): Promise<TeamSong> => {
      const { data } = await client.patch<ApiResponse<TeamSongResponseDto>>(
        `/api/v1/teams/${teamId}/songs/${songId}`,
        request
      )
      return toTeamSongModel(data.data)
    },
    getForm: async (
      teamId: string,
      songId: string
    ): Promise<SongFormResponseDto> => {
      const { data } = await client.get<ApiResponse<SongFormResponseDto>>(
        `/api/v1/teams/${teamId}/songs/${songId}/form`
      )
      return data.data
    },
    updateForm: async (
      teamId: string,
      songId: string,
      request: SongFormUpdateRequestDto
    ): Promise<SongFormResponseDto> => {
      const { data } = await client.put<ApiResponse<SongFormResponseDto>>(
        `/api/v1/teams/${teamId}/songs/${songId}/form`,
        request
      )
      return data.data
    },
  }
}
