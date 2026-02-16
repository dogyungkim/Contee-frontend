import apiClient from '@/lib/api';
import {
  CreateTeamRequest,
  UpdateTeamRequest,
  AddTeamMemberRequest,
  JoinTeamRequest,
  UpdateTeamMemberRoleRequest,
} from '@/types/team';
import type { ApiResponse } from '@/types/api';
import type { Team, TeamSummary, TeamMember } from '@/domains/team/models/team';
import {
  toTeamModel,
  toTeamSummaryModel,
  toTeamMemberModel,
} from '@/domains/team/api/team.mapper';
import type {
  TeamResponseDto,
  TeamSummaryResponseDto,
  TeamMemberResponseDto,
} from '@/domains/team/api/team.dto';

export const createTeam = async (data: CreateTeamRequest): Promise<Team> => {
  const response = await apiClient.post<ApiResponse<TeamResponseDto>>('/api/v1/teams', data);
  return toTeamModel(response.data.data);
};

export const getMyTeams = async (): Promise<TeamSummary[]> => {
  const response = await apiClient.get<ApiResponse<TeamSummaryResponseDto[]>>('/api/v1/teams');
  return response.data.data.map(toTeamSummaryModel);
};

export const getTeam = async (id: string): Promise<Team> => {
  const response = await apiClient.get<ApiResponse<TeamResponseDto>>(`/api/v1/teams/${id}`);
  return toTeamModel(response.data.data);
};

export const updateTeam = async (id: string, data: UpdateTeamRequest): Promise<Team> => {
  const response = await apiClient.put<ApiResponse<TeamResponseDto>>(`/api/v1/teams/${id}`, data);
  return toTeamModel(response.data.data);
};

export const deleteTeam = async (id: string): Promise<void> => {
  await apiClient.delete<ApiResponse<null>>(`/api/v1/teams/${id}`);
};

export const getTeamMembers = async (id: string): Promise<TeamMember[]> => {
  const response = await apiClient.get<ApiResponse<TeamMemberResponseDto[]>>(`/api/v1/teams/${id}/members`);
  return response.data.data.map(toTeamMemberModel);
};

export const addTeamMember = async (id: string, data: AddTeamMemberRequest): Promise<TeamMember> => {
  const response = await apiClient.post<ApiResponse<TeamMemberResponseDto>>(`/api/v1/teams/${id}/members`, data);
  return toTeamMemberModel(response.data.data);
};

export const joinTeam = async (shortCode: string): Promise<TeamMember> => {
  const data: JoinTeamRequest = { shortCode };
  const response = await apiClient.post<ApiResponse<TeamMemberResponseDto>>('/api/v1/teams/join', data);
  return toTeamMemberModel(response.data.data);
};

export const removeTeamMember = async (teamId: string, userId: string): Promise<void> => {
  await apiClient.delete<ApiResponse<null>>(`/api/v1/teams/${teamId}/members/${userId}`);
};

export const updateTeamMemberRole = async (
  teamId: string,
  userId: string,
  role: UpdateTeamMemberRoleRequest,
): Promise<TeamMember> => {
  const response = await apiClient.put<ApiResponse<TeamMemberResponseDto>>(
    `/api/v1/teams/${teamId}/members/${userId}/role`,
    role,
  );
  return toTeamMemberModel(response.data.data);
};
