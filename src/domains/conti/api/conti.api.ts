import apiClient from '@/lib/api';
import type { ApiResponse, PageDto } from '@/types/api';
import type { Conti } from '@/domains/conti/models/conti';
import type {
  ContiResponseDto,
  CreateContiRequestDto,
  UpdateContiRequestDto,
  ContiSearchParamsDto,
} from '@/domains/conti/api/conti.dto';
import { toContiModel } from '@/domains/conti/api/conti.mapper';

export async function getTeamContis(
  teamId: string,
  params: ContiSearchParamsDto = {},
): Promise<PageDto<Conti>> {
  const { data } = await apiClient.get<ApiResponse<PageDto<ContiResponseDto>>>(
    '/api/v1/contis',
    { params: { ...params, teamId } },
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
