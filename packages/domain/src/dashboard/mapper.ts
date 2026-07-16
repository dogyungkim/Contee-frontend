import type {
  Activity,
  DashboardConti,
  DashboardData,
  DashboardSummary,
} from './model'
import type {
  ActivityDto,
  DashboardContiDto,
  DashboardDataDto,
  DashboardSummaryDto,
} from './dto'

export const toDashboardSummaryModel = (
  dto: DashboardSummaryDto
): DashboardSummary => ({
  nextServiceLabel: dto.nextServiceLabel,
  nextServiceDateLabel: dto.nextServiceDateLabel,
  thisWeekContiCount: dto.thisWeekContiCount,
  totalSongCount: dto.totalSongCount,
})

export const toActivityModel = (dto: ActivityDto): Activity => ({
  id: dto.id,
  timeLabel: dto.timeLabel,
  message: dto.message,
})

export const toDashboardContiModel = (
  dto: DashboardContiDto
): DashboardConti => ({ ...dto })

export const toDashboardDataModel = (dto: DashboardDataDto): DashboardData => ({
  summary: toDashboardSummaryModel(dto.summary),
  recentContis: dto.recentContis.map(toDashboardContiModel),
  songs: dto.songs,
  activities: dto.activities.map(toActivityModel),
})
