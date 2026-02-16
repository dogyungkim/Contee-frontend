import type { TeamMember, TeamRole, TeamSummary } from '../models/team';

export type TeamSummaryResponseDto = TeamSummary;

export interface TeamResponseDto {
  id: string;
  name: string;
  shortCode: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  members: TeamMember[];
}

export type TeamMemberResponseDto = TeamMember;

export interface CreateTeamRequestDto {
  name: string;
  description?: string;
}

export interface UpdateTeamRequestDto {
  name?: string;
  description?: string;
}

export interface JoinTeamRequestDto {
  shortCode: string;
}

export interface AddTeamMemberRequestDto {
  userId: string;
  role: TeamRole;
}

export interface UpdateTeamMemberRoleRequestDto {
  role: TeamRole;
}
