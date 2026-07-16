import { createTeamRepository } from '@contee/api-client';
import apiClient from '@/lib/api';
import {
  CreateTeamRequest,
  UpdateTeamRequest,
  AddTeamMemberRequest,
  UpdateTeamMemberRoleRequest,
} from '@/types/team';
import type { Team, TeamSummary, TeamMember } from '@/domains/team/models/team';

const teamRepository = createTeamRepository(apiClient);

export const createTeam = async (data: CreateTeamRequest): Promise<Team> => {
  return teamRepository.create(data);
};

export const getMyTeams = async (): Promise<TeamSummary[]> => {
  return teamRepository.listMine();
};

export const getTeam = async (id: string): Promise<Team> => {
  return teamRepository.get(id);
};

export const updateTeam = async (id: string, data: UpdateTeamRequest): Promise<Team> => {
  return teamRepository.update(id, data);
};

export const deleteTeam = async (id: string): Promise<void> => {
  await teamRepository.remove(id);
};

export const getTeamMembers = async (id: string): Promise<TeamMember[]> => {
  return teamRepository.listMembers(id);
};

export const addTeamMember = async (id: string, data: AddTeamMemberRequest): Promise<TeamMember> => {
  return teamRepository.addMember(id, data);
};

export const joinTeam = async (shortCode: string): Promise<TeamMember> => {
  return teamRepository.join(shortCode);
};

export const removeTeamMember = async (teamId: string, userId: string): Promise<void> => {
  await teamRepository.removeMember(teamId, userId);
};

export const updateTeamMemberRole = async (
  teamId: string,
  userId: string,
  role: UpdateTeamMemberRoleRequest,
): Promise<TeamMember> => {
  return teamRepository.updateMemberRole(teamId, userId, role);
};
