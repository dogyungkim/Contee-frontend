import type { Conti } from '@/domains/conti/models/conti';
import type { Song } from '@/domains/song/models/song';

export interface DashboardSummary {
  nextServiceLabel: string;
  nextServiceDateLabel: string;
  thisWeekContiCount: number;
  totalSongCount: number;
}

export interface Activity {
  id: string;
  timeLabel: string;
  message: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  recentContis: Conti[];
  songs: Song[];
  activities: Activity[];
}
