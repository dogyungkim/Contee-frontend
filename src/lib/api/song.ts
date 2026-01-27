import apiClient from '../api';
import { ApiResponse } from '@/types/team';
import type { TeamSong, CreateTeamSongRequest, UpdateTeamSongRequest, TeamSongSearchParams } from '@/types/song';

/**
 * TeamSong API
 */

// Get all songs for a team
export async function getTeamSongs(teamId: string, params?: TeamSongSearchParams): Promise<TeamSong[]> {
    const { data } = await apiClient.get<ApiResponse<TeamSong[]>>(`/api/v1/teams/${teamId}/songs`, {
        params
    });
    return data.data;
}

// Get single team song
export async function getTeamSong(teamId: string, teamSongId: string): Promise<TeamSong> {
    const { data } = await apiClient.get<ApiResponse<TeamSong>>(`/api/v1/teams/${teamId}/songs/${teamSongId}`);
    return data.data;
}

// Create team song
export async function createTeamSong(teamId: string, request: CreateTeamSongRequest): Promise<TeamSong> {
    const { data } = await apiClient.post<ApiResponse<TeamSong>>(`/api/v1/teams/${teamId}/songs`, request);
    return data.data;
}

// Update team song
export async function updateTeamSong(
    teamId: string,
    teamSongId: string,
    request: UpdateTeamSongRequest
): Promise<TeamSong> {
    const { data } = await apiClient.patch<ApiResponse<TeamSong>>(`/api/v1/teams/${teamId}/songs/${teamSongId}`, request);
    return data.data;
}

// Delete team song
export async function deleteTeamSong(teamId: string, teamSongId: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/api/v1/teams/${teamId}/songs/${teamSongId}`);
}

// Search master songs
export async function searchSongs(query: string): Promise<import('@/types/song').Song[]> {
    const { data } = await apiClient.get<ApiResponse<import('@/types/song').Song[]>>('/api/v1/songs', {
        params: { q: query }
    });
    return data.data;
}
