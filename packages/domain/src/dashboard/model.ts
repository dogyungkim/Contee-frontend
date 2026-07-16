import type { Song } from '../song/model'

export interface DashboardSummary {
  nextServiceLabel: string
  nextServiceDateLabel: string
  thisWeekContiCount: number
  totalSongCount: number
}

export interface Activity {
  id: string
  timeLabel: string
  message: string
}

export interface DashboardConti {
  id: string
  title: string
  worshipDate: string
  updatedAt: string
  songCount: number
}

export interface DashboardData {
  summary: DashboardSummary
  recentContis: DashboardConti[]
  songs: Song[]
  activities: Activity[]
}
