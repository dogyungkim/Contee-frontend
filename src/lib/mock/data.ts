import { Team, TeamMember } from '@/types/team';

export type DashboardSummary = {
    nextServiceLabel: string
    nextServiceDateLabel: string
    thisWeekContiCount: number
    totalSongCount: number
}

export type Conti = {
    id: string
    title: string
    dateLabel: string
    songCount: number
}

export type Song = {
    id: string
    title: string
    artist: string
    defaultKey?: string
    bpm?: number
}

export type Activity = {
    id: string
    timeLabel: string
    message: string
}

export const MOCK_DASHBOARD_SUMMARY: DashboardSummary = {
    nextServiceLabel: '주일 예배',
    nextServiceDateLabel: '이번 주 일요일 11:00',
    thisWeekContiCount: 1,
    totalSongCount: 128,
}

export const MOCK_RECENT_CONTIS: Conti[] = [
    { id: 'c_001', title: '주일 예배 콘티', dateLabel: '2026-01-19', songCount: 6 },
    { id: 'c_002', title: '수요 예배 콘티', dateLabel: '2026-01-15', songCount: 5 },
    { id: 'c_003', title: '청년부 예배 콘티', dateLabel: '2026-01-12', songCount: 7 },
]

export const MOCK_SONGS: Song[] = [
    { id: 's_001', title: '주의 은혜라', artist: '마커스', defaultKey: 'G', bpm: 72 },
    { id: 's_002', title: '주님 한 분만으로', artist: '어노인팅', defaultKey: 'E', bpm: 68 },
    { id: 's_003', title: '하늘 위에 주님밖에', artist: '마커스', defaultKey: 'A', bpm: 80 },
    { id: 's_004', title: '예수 사랑하심은', artist: 'Hymn', defaultKey: 'C', bpm: 96 },
]

export const MOCK_ACTIVITIES: Activity[] = [
    { id: 'a_001', timeLabel: '방금', message: '로그인에 성공했어요.' },
    { id: 'a_002', timeLabel: '1시간 전', message: '"주일 예배 콘티"를 열람했어요.' },
    { id: 'a_003', timeLabel: '어제', message: '곡 "주의 은혜라"를 확인했어요.' },
]

// --- Team & User Mock Data ---

export const MOCK_TEAMS: Team[] = [
    {
        id: 'team-1',
        name: 'Worship Team A',
        shortCode: 'WSHIP001',
        description: 'Main Sunday Worship Team',
        createdAt: '2023-01-01T09:00:00Z',
        updatedAt: '2023-01-15T10:00:00Z',
        memberCount: 5,
    },
    {
        id: 'team-2',
        name: 'Youth Ministry',
        shortCode: 'YOUTH002',
        description: 'Friday Night Youth Service',
        createdAt: '2023-02-01T14:00:00Z',
        updatedAt: '2023-02-01T14:00:00Z',
        memberCount: 12,
    },
];

export const MOCK_MEMBERS_TEAM_1: TeamMember[] = [
    {
        id: 'member-1',
        userId: 'user-1',
        userName: 'John Doe',
        userEmail: 'john@example.com',
        role: 'OWNER',
        joinedAt: '2023-01-01T09:00:00Z',
    },
    {
        id: 'member-2',
        userId: 'user-2',
        userName: 'Jane Smith',
        userEmail: 'jane@example.com',
        role: 'ADMIN',
        joinedAt: '2023-01-02T10:00:00Z',
    },
    {
        id: 'member-3',
        userId: 'user-3',
        userName: 'Mike Johnson',
        userEmail: 'mike@example.com',
        role: 'MEMBER',
        joinedAt: '2023-01-05T11:00:00Z',
    },
];

export const MOCK_MEMBERS_TEAM_2: TeamMember[] = [
    {
        id: 'member-4',
        userId: 'user-1',
        userName: 'John Doe',
        userEmail: 'john@example.com',
        role: 'MEMBER',
        joinedAt: '2023-02-01T14:00:00Z',
    },
    {
        id: 'member-5',
        userId: 'user-4',
        userName: 'Sarah Lee',
        userEmail: 'sarah@example.com',
        role: 'OWNER',
        joinedAt: '2023-02-01T14:00:00Z',
    },
];

export const MOCK_USER = {
    id: 'user-1',
    email: 'john@example.com',
    name: 'John Doe',
    createdAt: '2023-01-01T09:00:00Z',
};

export const MOCK_USER_ID = 'user-1';
