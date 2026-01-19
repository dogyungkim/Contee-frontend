import { AxiosAdapter, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { MOCK_TEAMS, MOCK_MEMBERS_TEAM_1, MOCK_MEMBERS_TEAM_2, MOCK_USER_ID } from './data';
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

// Helper to create error response
// const error = (status: number, message: string): Promise<never> => {
//   return Promise.reject({
//     response: {
//       status,
//       data: { success: false, message },
//     },
//   });
// };

export const mockAdapter: AxiosAdapter = async (config) => {
    const { url, method, data } = config;
    const methodUpper = method?.toUpperCase();

    console.log(`[MockAdapter] ${methodUpper} ${url}`, data);

    // Intentional delay for realism
    await new Promise((resolve) => setTimeout(resolve, 300));

    // --- Teams API ---

    // 1. Create Team (POST /api/v1/teams)
    if (url === '/api/v1/teams' && methodUpper === 'POST') {
        const body = JSON.parse(data);
        const newTeam: Team = {
            id: `team-${Date.now()}`,
            name: body.name,
            shortCode: 'NEW12345',
            description: body.description || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            memberCount: 1,
        };
        MOCK_TEAMS.push(newTeam);
        return success(newTeam);
    }

    // 2. Get My Teams (GET /api/v1/teams)
    if (url === '/api/v1/teams' && methodUpper === 'GET') {
        return success(MOCK_TEAMS);
    }

    // 3. Get Team Detail (GET /api/v1/teams/{id})
    const teamDetailMatch = url?.match(/^\/api\/v1\/teams\/([a-zA-Z0-9-]+)$/);
    if (teamDetailMatch && methodUpper === 'GET') {
        const teamId = teamDetailMatch[1];
        const team = MOCK_TEAMS.find((t) => t.id === teamId);
        if (team) return success(team);
        // Return 404/Null if not found
        return success(null); // Or reject
    }

    // 4. Update Team (PUT /api/v1/teams/{id})
    if (teamDetailMatch && methodUpper === 'PUT') {
        const teamId = teamDetailMatch[1];
        const body = JSON.parse(data);
        const team = MOCK_TEAMS.find((t) => t.id === teamId);
        if (team) {
            const updatedTeam = { ...team, ...body, updatedAt: new Date().toISOString() };
            return success(updatedTeam);
        }
    }

    // 5. Delete Team (DELETE /api/v1/teams/{id})
    if (teamDetailMatch && methodUpper === 'DELETE') {
        return success(null);
    }

    // --- Members API ---

    // 6. Get Team Members (GET /api/v1/teams/{id}/members)
    const membersMatch = url?.match(/^\/api\/v1\/teams\/([a-zA-Z0-9-]+)\/members$/);
    if (membersMatch && methodUpper === 'GET') {
        const teamId = membersMatch[1];
        if (teamId === 'team-1') return success(MOCK_MEMBERS_TEAM_1);
        if (teamId === 'team-2') return success(MOCK_MEMBERS_TEAM_2);
        return success([]);
    }

    // 7. Add Team Member (POST /api/v1/teams/{id}/members)
    if (membersMatch && methodUpper === 'POST') {
        const body = JSON.parse(data);
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

    // 8. Join Team (POST /api/v1/teams/join)
    if (url === '/api/v1/teams/join' && methodUpper === 'POST') {
        return success({
            id: 'member-new',
            role: 'MEMBER',
            joinedAt: new Date().toISOString()
        });
    }

    // 9. Remove Member (DELETE /api/v1/teams/{id}/members/{userId})
    const removeMemberMatch = url?.match(/^\/api\/v1\/teams\/([a-zA-Z0-9-]+)\/members\/([a-zA-Z0-9-]+)$/);
    if (removeMemberMatch && methodUpper === 'DELETE') {
        return success(null);
    }

    // 10. Update Member Role (PUT /api/v1/teams/{id}/members/{userId}/role)
    const roleUpdateMatch = url?.match(/^\/api\/v1\/teams\/([a-zA-Z0-9-]+)\/members\/([a-zA-Z0-9-]+)\/role$/);
    if (roleUpdateMatch && methodUpper === 'PUT') {
        const body = JSON.parse(data);
        // Just return dummy data
        return success({
            id: roleUpdateMatch[2],
            role: body.role,
            joinedAt: new Date().toISOString()
        });
    }

    // Default fallback
    console.warn(`[MockAdapter] Unhandled request: ${methodUpper} ${url}`);
    // Pass through to real network if needed, or 404
    // For strict mock mode, maybe 404
    return {
        data: { success: false, message: 'Mock route not found' },
        status: 404,
        statusText: 'Not Found',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
    };
};
