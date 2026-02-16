import type {
  TeamResponseDto,
  TeamSummaryResponseDto,
  TeamMemberResponseDto,
} from './team.dto';
import type { Team, TeamSummary, TeamMember } from '../models/team';

export const toTeamSummaryModel = (dto: TeamSummaryResponseDto): TeamSummary => ({ ...dto });

export const toTeamMemberModel = (dto: TeamMemberResponseDto): TeamMember => ({ ...dto });

export const toTeamModel = (dto: TeamResponseDto): Team => ({
  ...dto,
  members: dto.members.map(toTeamMemberModel),
});
