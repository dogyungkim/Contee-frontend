import type { Team, TeamMember, TeamSummary } from './model'
import type {
  TeamMemberResponseDto,
  TeamResponseDto,
  TeamSummaryResponseDto,
} from './dto'

export const toTeamSummaryModel = (
  dto: TeamSummaryResponseDto
): TeamSummary => ({ ...dto })

export const toTeamMemberModel = (dto: TeamMemberResponseDto): TeamMember => ({
  ...dto,
})

export const toTeamModel = (dto: TeamResponseDto): Team => ({ ...dto })
