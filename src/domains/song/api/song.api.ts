import apiClient from '@/lib/api';
import type { ApiResponse, PageDto } from '@/types/api';
import type { TeamSong } from '@/domains/song/models/song';
import type {
  TeamSongResponseDto,
  UpdateTeamSongRequestDto,
  TeamSongSearchParamsDto,
} from '@/domains/song/api/song.dto';
import { toTeamSongModel } from '@/domains/song/api/song.mapper';

export async function getTeamSongs(teamId: string, params?: TeamSongSearchParamsDto): Promise<TeamSong[]> {
  const { data } = await apiClient.get<ApiResponse<PageDto<TeamSongResponseDto>>>(
    `/api/v1/teams/${teamId}/songs`,
    { params },
  );
  return data.data.content.map(toTeamSongModel);
}

export async function updateTeamSong(
  teamId: string,
  teamSongId: string,
  request: UpdateTeamSongRequestDto,
): Promise<TeamSong> {
  const { data } = await apiClient.patch<ApiResponse<TeamSongResponseDto>>(
    `/api/v1/teams/${teamId}/songs/${teamSongId}`,
    request,
  );
  return toTeamSongModel(data.data);
}
