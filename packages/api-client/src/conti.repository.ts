import type { AxiosInstance } from 'axios'
import type {
  ApiResponse,
  Conti,
  ContiResponseDto,
  CreateContiRequestDto,
  UpdateContiRequestDto,
} from '@contee/domain'
import { toContiModel } from '@contee/domain'

import { createContiReadRepository } from './conti-read.repository'

export function createContiRepository(client: AxiosInstance) {
  return {
    ...createContiReadRepository(client),
    create: async (request: CreateContiRequestDto): Promise<Conti> => {
      const { data } = await client.post<ApiResponse<ContiResponseDto>>(
        '/api/v1/contis',
        request
      )
      return toContiModel(data.data)
    },
    update: async (
      id: string,
      request: UpdateContiRequestDto
    ): Promise<Conti> => {
      const { data } = await client.put<ApiResponse<ContiResponseDto>>(
        `/api/v1/contis/${id}`,
        request
      )
      return toContiModel(data.data)
    },
    publish: async (id: string): Promise<Conti> => {
      const { data } = await client.post<ApiResponse<ContiResponseDto>>(
        `/api/v1/contis/${id}/publish`
      )
      return toContiModel(data.data)
    },
    remove: async (id: string): Promise<void> => {
      await client.delete<ApiResponse<null>>(`/api/v1/contis/${id}`)
    },
  }
}
