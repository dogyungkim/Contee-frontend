import type { AxiosInstance } from 'axios'
import type {
  ApiResponse,
  Conti,
  ContiResponseDto,
  ContiSearchParamsDto,
  PageDto,
  SharedConti,
  SharedContiResponseDto,
} from '@contee/domain'
import { toContiModel, toSharedContiModel } from '@contee/domain'

export function createContiReadRepository(client: AxiosInstance) {
  return {
    listByTeam: async (
      teamId: string,
      params: ContiSearchParamsDto = {}
    ): Promise<PageDto<Conti>> => {
      const { data } = await client.get<ApiResponse<PageDto<ContiResponseDto>>>(
        `/api/v1/teams/${teamId}/contis`,
        { params }
      )

      return {
        ...data.data,
        content: data.data.content.map(toContiModel),
      }
    },

    get: async (contiId: string): Promise<Conti> => {
      const { data } = await client.get<ApiResponse<ContiResponseDto>>(
        `/api/v1/contis/${contiId}`
      )
      return toContiModel(data.data)
    },

    getShared: async (token: string): Promise<SharedConti> => {
      const { data } = await client.get<ApiResponse<SharedContiResponseDto>>(
        `/api/v1/share/contis/${token}`
      )
      return toSharedContiModel(data.data)
    },
  }
}
