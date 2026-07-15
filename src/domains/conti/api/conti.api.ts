import apiClient from '@/lib/api';
import { isSafeApiUrl } from '@/lib/safe-url';
import type { ApiResponse, PageDto } from '@/types/api';
import type { Conti, ExternalShare, SharedConti } from '@/domains/conti/models/conti';
import type {
  ContiResponseDto,
  CreateContiRequestDto,
  ExternalShareResponseDto,
  SharedContiResponseDto,
  UpdateContiRequestDto,
  ContiSearchParamsDto,
  SheetMusicFileResponseDto,
} from '@/domains/conti/api/conti.dto';
import { toContiModel, toSharedContiModel } from '@/domains/conti/api/conti.mapper';

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

export async function publishConti(contiId: string): Promise<Conti> {
  const { data } = await apiClient.post<ApiResponse<ContiResponseDto>>(
    `/api/v1/contis/${contiId}/publish`,
  );
  return toContiModel(data.data);
}

export async function deleteConti(contiId: string): Promise<void> {
  await apiClient.delete<ApiResponse<void>>(`/api/v1/contis/${contiId}`);
}

export async function uploadContiSongSheetMusic(
  contiId: string,
  contiSongId: string,
  file: File,
): Promise<SheetMusicFileResponseDto> {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await apiClient.put<ApiResponse<SheetMusicFileResponseDto>>(
    `/api/v1/contis/${contiId}/songs/${contiSongId}/sheet-music`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data.data;
}

export async function deleteContiSongSheetMusic(
  contiId: string,
  contiSongId: string,
): Promise<void> {
  await apiClient.delete<ApiResponse<void>>(
    `/api/v1/contis/${contiId}/songs/${contiSongId}/sheet-music`,
  );
}

export async function downloadContiSongSheetMusic(
  downloadUrl: string,
  signal?: AbortSignal,
): Promise<Uint8Array> {
  if (!isSafeApiUrl(downloadUrl)) {
    throw new Error('Unsafe sheet music download URL');
  }

  const { data } = await apiClient.get<ArrayBuffer>(downloadUrl, {
    responseType: 'arraybuffer',
    signal,
  });
  return new Uint8Array(data);
}

export async function enableExternalShare(contiId: string): Promise<ExternalShare> {
  const { data } = await apiClient.post<ApiResponse<ExternalShareResponseDto>>(
    `/api/v1/contis/${contiId}/external-share`,
  );
  return data.data;
}

export async function disableExternalShare(contiId: string): Promise<void> {
  await apiClient.delete<ApiResponse<void>>(`/api/v1/contis/${contiId}/external-share`);
}

export async function getSharedConti(token: string): Promise<SharedConti> {
  const { data } = await apiClient.get<ApiResponse<SharedContiResponseDto>>(
    `/api/v1/share/contis/${token}`,
  );
  return toSharedContiModel(data.data);
}
