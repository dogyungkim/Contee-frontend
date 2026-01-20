import { AxiosAdapter, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { MOCK_TEAMS, MOCK_MEMBERS_TEAM_1, MOCK_MEMBERS_TEAM_2, MOCK_USER } from './data';
import { Team, TeamMember } from '@/types/team';

// Helper to create successful response
const success = (data: any): AxiosResponse => {
    return {
        data: {
            success: true,
            message: 'Mock Success',
            data,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
    };
};

export const mockAdapter: AxiosAdapter = async (config) => {
    const { url, method, data } = config;
    const methodUpper = method?.toUpperCase();

    console.log(`[MockAdapter] ${methodUpper} ${url}`, { data, headers: config.headers });

    // Intentional delay for realism
    await new Promise((resolve) => setTimeout(resolve, 300));

    // --- Auth & User API ---

    // 1. Get Current User (GET /api/v1/users/me)
    // if (url === '/api/v1/users/me' && methodUpper === 'GET') {
    //     const authHeader = config.headers.Authorization;
    //     if (authHeader && authHeader.toString().startsWith('Bearer ')) {
    //         return success(MOCK_USER);
    //     }
    //     return success(null);
    // }

    // // 2. Refresh Token (POST /api/v1/auth/refresh)
    // if (url === '/api/v1/auth/refresh' && methodUpper === 'POST') {
    //     return success({
    //         accessToken: 'mock-access-token-' + Date.now(),
    //         expiresIn: 3600,
    //     });
    // }

    // // 3. Logout (POST /api/v1/auth/logout)
    // if (url === '/api/v1/auth/logout' && methodUpper === 'POST') {
    //     return success(null);
    // }

    // --- Teams API ---

    // 4. Create Team (POST /api/v1/teams)
    if (url === '/api/v1/teams' && methodUpper === 'POST') {
        const body = data ? JSON.parse(data) : {};
        const newTeam: Team = {
            id: `team-${Date.now()}`,
            name: body.name || 'New Team',
            shortCode: 'NEW12345',
            description: body.description || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            memberCount: 1,
        };
        MOCK_TEAMS.push(newTeam);
        return success(newTeam);
    }

    // 5. Get My Teams (GET /api/v1/teams)
    if (url === '/api/v1/teams' && methodUpper === 'GET') {
        return success(MOCK_TEAMS);
    }

    // 6. Get Team Detail (GET /api/v1/teams/{id})
    const teamDetailMatch = url?.match(/^\/api\/v1\/teams\/([a-zA-Z0-9-]+)$/);
    if (teamDetailMatch && methodUpper === 'GET') {
        const teamId = teamDetailMatch[1];
        const team = MOCK_TEAMS.find((t) => t.id === teamId);
        if (team) return success(team);
        return success(null);
    }

    // 7. Update Team (PUT /api/v1/teams/{id})
    if (teamDetailMatch && methodUpper === 'PUT') {
        const teamId = teamDetailMatch[1];
        const body = data ? JSON.parse(data) : {};
        const team = MOCK_TEAMS.find((t) => t.id === teamId);
        if (team) {
            const updatedTeam = { ...team, ...body, updatedAt: new Date().toISOString() };
            return success(updatedTeam);
        }
    }

    // 8. Delete Team (DELETE /api/v1/teams/{id})
    if (teamDetailMatch && methodUpper === 'DELETE') {
        return success(null);
    }

    // --- Members API ---

    // 9. Get Team Members (GET /api/v1/teams/{id}/members)
    const membersMatch = url?.match(/^\/api\/v1\/teams\/([a-zA-Z0-9-]+)\/members$/);
    if (membersMatch && methodUpper === 'GET') {
        const teamId = membersMatch[1];
        if (teamId === 'team-1') return success(MOCK_MEMBERS_TEAM_1);
        if (teamId === 'team-2') return success(MOCK_MEMBERS_TEAM_2);
        return success([]);
    }

    // 10. Add Team Member (POST /api/v1/teams/{id}/members)
    if (membersMatch && methodUpper === 'POST') {
        const body = data ? JSON.parse(data) : {};
        const newMember: TeamMember = {
            id: `member-${Date.now()}`,
            userId: body.userId,
            userName: 'New User',
            userEmail: 'newuser@example.com',
            role: body.role,
            joinedAt: new Date().toISOString()
        }
        return success(newMember);
    }

    // --- Dashboard API ---

    // 12. Get Dashboard Summary (GET /api/v1/dashboard/summary)
    if (url === '/api/v1/dashboard/summary' && methodUpper === 'GET') {
        const { MOCK_DASHBOARD_SUMMARY } = await import('./data');
        return success(MOCK_DASHBOARD_SUMMARY);
    }

    // 13. Get Recent Contis (GET /api/v1/dashboard/contis/recent)
    if (url === '/api/v1/dashboard/contis/recent' && methodUpper === 'GET') {
        const { MOCK_RECENT_CONTIS } = await import('./data');
        return success(MOCK_RECENT_CONTIS);
    }

    // 14. Get Songs (GET /api/v1/dashboard/songs)
    if (url === '/api/v1/dashboard/songs' && methodUpper === 'GET') {
        const { MOCK_SONGS } = await import('./data');
        return success(MOCK_SONGS);
    }

    // 15. Get Activities (GET /api/v1/dashboard/activities)
    if (url === '/api/v1/dashboard/activities' && methodUpper === 'GET') {
        const { MOCK_ACTIVITIES } = await import('./data');
        return success(MOCK_ACTIVITIES);
    }

    // 16. Get All Dashboard Data (GET /api/v1/dashboard)
    if (url === '/api/v1/dashboard' && methodUpper === 'GET') {
        const {
            MOCK_DASHBOARD_SUMMARY,
            MOCK_RECENT_CONTIS,
            MOCK_SONGS,
            MOCK_ACTIVITIES,
        } = await import('./data');
        return success({
            summary: MOCK_DASHBOARD_SUMMARY,
            recentContis: MOCK_RECENT_CONTIS,
            songs: MOCK_SONGS,
            activities: MOCK_ACTIVITIES,
        });
    }

    // 11. Join Team (POST /api/v1/teams/join)
    if (url === '/api/v1/teams/join' && methodUpper === 'POST') {
        return success({
            id: 'member-new',
            role: 'MEMBER',
            joinedAt: new Date().toISOString()
        });
    }

    // Default fallback
    console.warn(`[MockAdapter] Unhandled request: ${methodUpper} ${url}`);
    return {
        data: { success: false, message: 'Mock route not found' },
        status: 404,
        statusText: 'Not Found',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
    };
};
