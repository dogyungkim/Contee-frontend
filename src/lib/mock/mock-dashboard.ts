export type DashboardSummary = {
  nextServiceLabel: string
  nextServiceDateLabel: string
  thisWeekContiCount: number
  totalSongCount: number
}

export type MockConti = {
  id: string
  title: string
  dateLabel: string
  songCount: number
}

export type MockSong = {
  id: string
  title: string
  artist: string
  defaultKey?: string
  bpm?: number
}

export type MockActivity = {
  id: string
  timeLabel: string
  message: string
}

export const mockDashboardSummary: DashboardSummary = {
  nextServiceLabel: '주일 예배',
  nextServiceDateLabel: '이번 주 일요일 11:00',
  thisWeekContiCount: 1,
  totalSongCount: 128,
}

export const mockRecentContis: MockConti[] = [
  { id: 'c_001', title: '주일 예배 콘티', dateLabel: '2026-01-19', songCount: 6 },
  { id: 'c_002', title: '수요 예배 콘티', dateLabel: '2026-01-15', songCount: 5 },
  { id: 'c_003', title: '청년부 예배 콘티', dateLabel: '2026-01-12', songCount: 7 },
]

export const mockSongs: MockSong[] = [
  { id: 's_001', title: '주의 은혜라', artist: '마커스', defaultKey: 'G', bpm: 72 },
  { id: 's_002', title: '주님 한 분만으로', artist: '어노인팅', defaultKey: 'E', bpm: 68 },
  { id: 's_003', title: '하늘 위에 주님밖에', artist: '마커스', defaultKey: 'A', bpm: 80 },
  { id: 's_004', title: '예수 사랑하심은', artist: 'Hymn', defaultKey: 'C', bpm: 96 },
]

export const mockActivities: MockActivity[] = [
  { id: 'a_001', timeLabel: '방금', message: '로그인에 성공했어요.' },
  { id: 'a_002', timeLabel: '1시간 전', message: '“주일 예배 콘티”를 열람했어요.' },
  { id: 'a_003', timeLabel: '어제', message: '곡 “주의 은혜라”를 확인했어요.' },
]

