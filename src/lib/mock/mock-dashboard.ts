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
  nextServiceLabel: '주일 2부 예배',
  nextServiceDateLabel: '2026년 6월 28일 11:00',
  thisWeekContiCount: 4,
  totalSongCount: 12,
}

export const mockRecentContis: MockConti[] = [
  { id: 'conti-1', title: '2026.06.28 주일 2부 예배', dateLabel: '2026-06-28', songCount: 3 },
  { id: 'conti-2', title: '2026.07.01 수요기도회', dateLabel: '2026-07-01', songCount: 2 },
  { id: 'conti-3', title: '2026.07.05 맥추감사주일', dateLabel: '2026-07-05', songCount: 1 },
  { id: 'conti-4', title: '2026.06.27 청년부 금요예배', dateLabel: '2026-06-27', songCount: 3 },
]

export const mockSongs: MockSong[] = [
  { id: 's_001', title: '주의 은혜라', artist: '마커스', defaultKey: 'G', bpm: 72 },
  { id: 's_002', title: '주님 한 분만으로', artist: '어노인팅', defaultKey: 'E', bpm: 68 },
  { id: 's_003', title: '하늘 위에 주님밖에', artist: '마커스', defaultKey: 'A', bpm: 80 },
  { id: 's_004', title: '나는 예배자입니다', artist: '어노인팅', defaultKey: 'F', bpm: 66 },
  { id: 's_005', title: 'Way Maker', artist: 'Leeland', defaultKey: 'B', bpm: 72 },
  { id: 's_006', title: 'No Longer Slaves', artist: 'Bethel Music', defaultKey: 'G', bpm: 74 },
]

export const mockActivities: MockActivity[] = [
  { id: 'a_001', timeLabel: '방금', message: '로그인에 성공했어요.' },
  { id: 'a_002', timeLabel: '15분 전', message: '“2026.06.28 주일 2부 예배” 콘티를 수정했어요.' },
  { id: 'a_003', timeLabel: '1시간 전', message: '외부 공유 링크가 생성되었어요.' },
  { id: 'a_004', timeLabel: '어제', message: '곡 “주의 은혜라”를 확인했어요.' },
  { id: 'a_005', timeLabel: '3일 전', message: '청년부 금요예배 콘티에 5곡을 추가했어요.' },
]
