import apiClient from '@/lib/api';
import type { ApiResponse } from '@/types/api';
import type { Song, TeamSong } from '@/domains/song/models/song';
import type {
  TeamSongResponseDto,
  SongResponseDto,
  CreateTeamSongRequestDto,
  UpdateTeamSongRequestDto,
  TeamSongSearchParamsDto,
} from '@/domains/song/api/song.dto';
import { toTeamSongModel } from '@/domains/song/api/song.mapper';

export async function getTeamSongs(teamId: string, params?: TeamSongSearchParamsDto): Promise<TeamSong[]> {
  const { data } = await apiClient.get<ApiResponse<TeamSongResponseDto[] | { content: TeamSongResponseDto[] }>>(
    `/api/v1/teams/${teamId}/songs`,
    { params },
  );
  const rawSongs = Array.isArray(data.data) ? data.data : data.data?.content ?? [];
  return rawSongs.map(toTeamSongModel);
}

export async function getTeamSong(teamId: string, teamSongId: string): Promise<TeamSong> {
  const { data } = await apiClient.get<ApiResponse<TeamSongResponseDto>>(`/api/v1/teams/${teamId}/songs/${teamSongId}`);
  return toTeamSongModel(data.data);
}

export async function createTeamSong(teamId: string, request: CreateTeamSongRequestDto): Promise<TeamSong> {
  const { data } = await apiClient.post<ApiResponse<TeamSongResponseDto>>(`/api/v1/teams/${teamId}/songs`, request);
  return toTeamSongModel(data.data);
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

export async function deleteTeamSong(teamId: string, teamSongId: string): Promise<void> {
  await apiClient.delete<ApiResponse<void>>(`/api/v1/teams/${teamId}/songs/${teamSongId}`);
}

export async function searchSongs(query: string): Promise<Song[]> {
  const { data } = await apiClient.get<ApiResponse<SongResponseDto[]>>('/api/v1/songs', {
    params: { q: query },
  });
  return data.data;
}
