import type {
  Activity,
  DashboardConti,
  DashboardData,
  DashboardSummary,
} from '@/domains/dashboard/models/dashboard';
import type {
  ActivityDto,
  DashboardContiDto,
  DashboardDataDto,
  DashboardSummaryDto,
} from '@/domains/dashboard/api/dashboard.dto';

export const toDashboardSummaryModel = (dto: DashboardSummaryDto): DashboardSummary => ({
  nextServiceLabel: dto.nextServiceLabel,
  nextServiceDateLabel: dto.nextServiceDateLabel,
  thisWeekContiCount: dto.thisWeekContiCount,
  totalSongCount: dto.totalSongCount,
});

export const toActivityModel = (dto: ActivityDto): Activity => ({
  id: dto.id,
  timeLabel: dto.timeLabel,
  message: dto.message,
});

export const toDashboardContiModel = (dto: DashboardContiDto): DashboardConti => ({ ...dto });

export const toDashboardDataModel = (dto: DashboardDataDto): DashboardData => ({
  summary: toDashboardSummaryModel(dto.summary),
  recentContis: dto.recentContis.map(toDashboardContiModel),
  songs: dto.songs,
  activities: dto.activities.map(toActivityModel),
});
