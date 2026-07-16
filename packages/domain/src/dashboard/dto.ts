import type { SongResponseDto } from '../song/dto'

export interface DashboardSummaryDto {
  nextServiceLabel: string
  nextServiceDateLabel: string
  thisWeekContiCount: number
  totalSongCount: number
}

export interface ActivityDto {
  id: string
  timeLabel: string
  message: string
}

export interface DashboardContiDto {
  id: string
  title: string
  worshipDate: string
  updatedAt: string
  songCount: number
}

export interface DashboardDataDto {
  summary: DashboardSummaryDto
  recentContis: DashboardContiDto[]
  songs: SongResponseDto[]
  activities: ActivityDto[]
}
