import type { AxiosInstance } from 'axios'
import type {
  AddTeamMemberRequestDto,
  ApiResponse,
  CreateTeamRequestDto,
  JoinTeamRequestDto,
  Team,
  TeamMember,
  TeamMemberResponseDto,
  TeamResponseDto,
  TeamSummary,
  TeamSummaryResponseDto,
  UpdateTeamMemberRoleRequestDto,
  UpdateTeamRequestDto,
} from '@contee/domain'
import {
  toTeamMemberModel,
  toTeamModel,
  toTeamSummaryModel,
} from '@contee/domain'

export function createTeamRepository(client: AxiosInstance) {
  return {
    create: async (data: CreateTeamRequestDto): Promise<Team> => {
      const response = await client.post<ApiResponse<TeamResponseDto>>(
        '/api/v1/teams',
        data
      )
      return toTeamModel(response.data.data)
    },

    listMine: async (): Promise<TeamSummary[]> => {
      const response =
        await client.get<ApiResponse<TeamSummaryResponseDto[]>>('/api/v1/teams')
      return response.data.data.map(toTeamSummaryModel)
    },

    get: async (id: string): Promise<Team> => {
      const response = await client.get<ApiResponse<TeamResponseDto>>(
        `/api/v1/teams/${id}`
      )
      return toTeamModel(response.data.data)
    },

    update: async (
      id: string,
      data: UpdateTeamRequestDto
    ): Promise<Team> => {
      const response = await client.put<ApiResponse<TeamResponseDto>>(
        `/api/v1/teams/${id}`,
        data
      )
      return toTeamModel(response.data.data)
    },

    remove: async (id: string): Promise<void> => {
      await client.delete<ApiResponse<null>>(`/api/v1/teams/${id}`)
    },

    listMembers: async (id: string): Promise<TeamMember[]> => {
      const response = await client.get<ApiResponse<TeamMemberResponseDto[]>>(
        `/api/v1/teams/${id}/members`
      )
      return response.data.data.map(toTeamMemberModel)
    },

    addMember: async (
      id: string,
      data: AddTeamMemberRequestDto
    ): Promise<TeamMember> => {
      const response = await client.post<ApiResponse<TeamMemberResponseDto>>(
        `/api/v1/teams/${id}/members`,
        data
      )
      return toTeamMemberModel(response.data.data)
    },

    join: async (shortCode: string): Promise<TeamMember> => {
      const data: JoinTeamRequestDto = { shortCode }
      const response = await client.post<ApiResponse<TeamMemberResponseDto>>(
        '/api/v1/teams/join',
        data
      )
      return toTeamMemberModel(response.data.data)
    },

    removeMember: async (teamId: string, userId: string): Promise<void> => {
      await client.delete<ApiResponse<null>>(
        `/api/v1/teams/${teamId}/members/${userId}`
      )
    },

    updateMemberRole: async (
      teamId: string,
      userId: string,
      role: UpdateTeamMemberRoleRequestDto
    ): Promise<TeamMember> => {
      const response = await client.put<ApiResponse<TeamMemberResponseDto>>(
        `/api/v1/teams/${teamId}/members/${userId}/role`,
        role
      )
      return toTeamMemberModel(response.data.data)
    },
  }
}
