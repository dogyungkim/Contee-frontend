import type { AxiosInstance } from 'axios'
import type {
  ApiResponse,
  Conti,
  ContiResponseDto,
  CreateContiRequestDto,
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
  }
}
