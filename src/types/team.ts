export type TeamRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

// Team Summary (used in list responses - GET /api/v1/teams)
export interface TeamSummary {
    id: string;
    name: string;
}

// Team Detail (used in detail responses - GET /api/v1/teams/{id})
export interface Team {
    id: string;
    name: string;
    shortCode: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    memberCount: number;
}

export interface TeamMember {
    id: string; // TeamMember ID
    userId: string; // User ID
    userName: string;
    userEmail: string;
    userProfileImageUrl?: string;
    role: TeamRole;
    joinedAt: string;
}

// Request DTOs
export interface CreateTeamRequest {
    name: string;
    description?: string;
}

export interface UpdateTeamRequest {
    name?: string;
    description?: string;
}

export interface JoinTeamRequest {
    shortCode: string;
}

export interface AddTeamMemberRequest {
    userId: string;
    role: TeamRole;
}

export interface UpdateTeamMemberRoleRequest {
    role: TeamRole;
}

// Common response wrapper is likely already handled or not needed if we return data directly,
// but based on docs, the API returns { success, message, data }.
// The API client likely unwraps this or we type it.
// Looking at api.ts, it returns basic axios response.
// Let's define the generic response type here for usage in api functions.

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}
