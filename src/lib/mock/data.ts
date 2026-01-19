import { Team, TeamMember } from '@/types/team';

// Mock Teams
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

// Mock Members for Team 1
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

// Mock Members for Team 2
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

export const MOCK_USER_ID = 'user-1'; // Assume current logged in user is user-1
