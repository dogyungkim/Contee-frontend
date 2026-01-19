import apiClient from '../api';
import {
    ApiResponse,
    CreateTeamRequest,
    UpdateTeamRequest,
    AddTeamMemberRequest,
    JoinTeamRequest,
    Team,
    TeamMember,
    UpdateTeamMemberRoleRequest,
} from '@/types/team';

// 1. 팀 생성
export const createTeam = async (data: CreateTeamRequest): Promise<Team> => {
    const response = await apiClient.post<ApiResponse<Team>>('/api/v1/teams', data);
    return response.data.data;
};

// 2. 내 팀 목록 조회
export const getMyTeams = async (): Promise<Team[]> => {
    const response = await apiClient.get<ApiResponse<Team[]>>('/api/v1/teams');
    return response.data.data;
};

// 3. 팀 상세 조회
export const getTeam = async (id: string): Promise<Team> => {
    const response = await apiClient.get<ApiResponse<Team>>(`/api/v1/teams/${id}`);
    return response.data.data;
};

// 4. 팀 정보 수정
export const updateTeam = async (id: string, data: UpdateTeamRequest): Promise<Team> => {
    const response = await apiClient.put<ApiResponse<Team>>(`/api/v1/teams/${id}`, data);
    return response.data.data;
};

// 5. 팀 삭제
export const deleteTeam = async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse<null>>(`/api/v1/teams/${id}`);
};

// 6. 팀 멤버 목록 조회
export const getTeamMembers = async (id: string): Promise<TeamMember[]> => {
    const response = await apiClient.get<ApiResponse<TeamMember[]>>(`/api/v1/teams/${id}/members`);
    return response.data.data;
};

// 7. 팀 멤버 직접 추가 (관리자)
export const addTeamMember = async (id: string, data: AddTeamMemberRequest): Promise<TeamMember> => {
    const response = await apiClient.post<ApiResponse<TeamMember>>(`/api/v1/teams/${id}/members`, data);
    return response.data.data;
};

// 8. 초대 코드로 팀 가입
export const joinTeam = async (shortCode: string): Promise<TeamMember> => {
    const data: JoinTeamRequest = { shortCode };
    const response = await apiClient.post<ApiResponse<TeamMember>>('/api/v1/teams/join', data);
    return response.data.data;
};

// 9. 팀 멤버 제거
export const removeTeamMember = async (teamId: string, userId: string): Promise<void> => {
    await apiClient.delete<ApiResponse<null>>(`/api/v1/teams/${teamId}/members/${userId}`);
};

// 10. 팀 멤버 역할 변경
export const updateTeamMemberRole = async (
    teamId: string,
    userId: string,
    role: UpdateTeamMemberRoleRequest
): Promise<TeamMember> => {
    const response = await apiClient.put<ApiResponse<TeamMember>>(
        `/api/v1/teams/${teamId}/members/${userId}/role`,
        role
    );
    return response.data.data;
};
