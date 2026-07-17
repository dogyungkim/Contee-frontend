import type { AxiosInstance } from 'axios'
import type {
  ApiResponse,
  PageDto,
  TeamSong,
  TeamSongResponseDto,
  TeamSongSearchParamsDto,
} from '@contee/domain'
import { toTeamSongModel } from '@contee/domain'

export function createSongReadRepository(client: AxiosInstance) {
  return {
    listByTeam: async (
      teamId: string,
      params: TeamSongSearchParamsDto = {}
    ): Promise<PageDto<TeamSong>> => {
      const { data } = await client.get<
        ApiResponse<PageDto<TeamSongResponseDto>>
      >(`/api/v1/teams/${teamId}/songs`, { params })

      return {
        ...data.data,
        content: data.data.content.map(toTeamSongModel),
      }
    },
  }
}
