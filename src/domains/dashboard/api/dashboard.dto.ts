import type { ContiResponseDto } from '@/domains/conti/api/conti.dto';
import type { SongResponseDto } from '@/domains/song/api/song.dto';

export interface DashboardSummaryDto {
  nextServiceLabel: string;
  nextServiceDateLabel: string;
  thisWeekContiCount: number;
  totalSongCount: number;
}

export interface ActivityDto {
  id: string;
  timeLabel: string;
  message: string;
}

export interface DashboardDataDto {
  summary: DashboardSummaryDto;
  recentContis: ContiResponseDto[];
  songs: SongResponseDto[];
  activities: ActivityDto[];
}
