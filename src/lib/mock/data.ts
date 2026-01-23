import { Team, TeamMember } from '@/types/team';
import { Conti, ContiSong } from '@/types/conti';
import { Song, TeamSong } from '@/types/song';

export type DashboardSummary = {
    nextServiceLabel: string
    nextServiceDateLabel: string
    thisWeekContiCount: number
    totalSongCount: number
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
];

export const MOCK_MEMBERS_TEAM_2: TeamMember[] = [
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

// --- Conti & Song Mock Data ---

export const MOCK_TEAM_SONGS: TeamSong[] = [
    {
        id: 'ts-1',
        teamId: 'team-1',
        customTitle: '주의 은혜라',
        artist: '마커스',
        keySignature: 'G',
        bpm: 72,
        isFavorite: true,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
    },
    {
        id: 'ts-2',
        teamId: 'team-1',
        customTitle: '주님 한 분만으로',
        artist: '어노인팅',
        keySignature: 'E',
        bpm: 68,
        isFavorite: false,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
    },
    {
        id: 'ts-3',
        teamId: 'team-1',
        customTitle: '하늘 위에 주님밖에',
        artist: '마커스',
        keySignature: 'A',
        bpm: 80,
        isFavorite: true,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
    },
];

export const MOCK_CONTIS: Conti[] = [
    {
        id: 'conti-1',
        teamId: 'team-1',
        title: '2024년 5월 19일 주일 예배',
        worshipDate: '2024-05-19',
        memo: '오순절 강림 주일',
        createdAt: '2024-05-10T10:00:00Z',
        updatedAt: '2024-05-10T10:00:00Z',
    },
];

export const MOCK_CONTI_SONGS: ContiSong[] = [
    {
        id: 'cs-1',
        contiId: 'conti-1',
        teamSongId: 'ts-1',
        orderIndex: 0,
        keyOverride: 'G',
        bpmOverride: 72,
        createdAt: '2024-05-10T10:05:00Z',
        updatedAt: '2024-05-10T10:05:00Z',
        teamSong: MOCK_TEAM_SONGS[0],
    },
];

// Special exports for dashboard components that expect simpler types
export const MOCK_RECENT_CONTIS = MOCK_CONTIS.map(c => ({
    id: c.id,
    title: c.title,
    dateLabel: c.worshipDate,
    songCount: 1
}));

export const MOCK_SONGS = MOCK_TEAM_SONGS.map(ts => ({
    id: ts.id,
    title: ts.customTitle,
    artist: ts.artist || '',
    defaultKey: ts.keySignature,
    bpm: ts.bpm
}));

// --- Master Song Mock Data ---

export const MOCK_MASTER_SONGS: Song[] = [
    {
        id: 'ms-1',
        title: '놀라운 주의 사랑',
        artist: '어노인팅',
        keySignature: 'E',
        bpm: 72,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
    },
    {
        id: 'ms-2',
        title: '꽃들도',
        artist: '제이워십',
        keySignature: 'E',
        bpm: 66,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
    },
    {
        id: 'ms-3',
        title: '주를 위한 이곳에',
        artist: '아이자야 씩스티원',
        keySignature: 'D',
        bpm: 68,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
    },
];
