import apiClient from '@/lib/api';
import type { ApiResponse, PageDto } from '@/types/api';
import type { Conti, ContiSong } from '@/domains/conti/models/conti';
import type {
  ContiResponseDto,
  ContiSongResponseDto,
  CreateContiRequestDto,
  UpdateContiRequestDto,
  AddContiSongRequestDto,
  UpdateContiSongRequestDto,
  ReorderContiSongsRequestDto,
  ContiSearchParamsDto,
} from '@/domains/conti/api/conti.dto';
import { toContiModel, toContiSongModel } from '@/domains/conti/api/conti.mapper';

export async function getTeamContis(
  teamId: string,
  params: ContiSearchParamsDto = {},
): Promise<PageDto<Conti>> {
  const { data } = await apiClient.get<ApiResponse<PageDto<ContiResponseDto>>>(
    `/api/v1/teams/${teamId}/contis`,
    { params },
  );
  return {
    ...data.data,
    content: data.data.content.map(toContiModel),
  };
}

export async function getConti(contiId: string): Promise<Conti> {
  const { data } = await apiClient.get<ApiResponse<ContiResponseDto>>(`/api/v1/contis/${contiId}`);
  return toContiModel(data.data);
}

export async function createConti(request: CreateContiRequestDto): Promise<Conti> {
  const { data } = await apiClient.post<ApiResponse<ContiResponseDto>>(`/api/v1/contis`, request);
  return toContiModel(data.data);
}

export async function updateConti(contiId: string, request: UpdateContiRequestDto): Promise<Conti> {
  const { data } = await apiClient.put<ApiResponse<ContiResponseDto>>(`/api/v1/contis/${contiId}`, request);
  return toContiModel(data.data);
}

export async function deleteConti(contiId: string): Promise<void> {
  await apiClient.delete<ApiResponse<void>>(`/api/v1/contis/${contiId}`);
}

export async function addContiSong(contiId: string, request: AddContiSongRequestDto): Promise<ContiSong> {
  const { data } = await apiClient.post<ApiResponse<ContiSongResponseDto>>(`/api/v1/contis/${contiId}/songs`, request);
  return toContiSongModel(data.data);
}

export async function removeContiSong(contiId: string, contiSongId: string): Promise<void> {
  await apiClient.delete<ApiResponse<void>>(`/api/v1/contis/${contiId}/songs/${contiSongId}`);
}

export async function updateContiSong(
  contiId: string,
  contiSongId: string,
  request: UpdateContiSongRequestDto,
): Promise<ContiSong> {
  const { data } = await apiClient.patch<ApiResponse<ContiSongResponseDto>>(
    `/api/v1/contis/${contiId}/songs/${contiSongId}`,
    request,
  );
  return toContiSongModel(data.data);
}

export async function reorderContiSongs(contiId: string, request: ReorderContiSongsRequestDto): Promise<void> {
  await apiClient.put<ApiResponse<void>>(`/api/v1/contis/${contiId}/songs/order`, request);
}
