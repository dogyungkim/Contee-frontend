import apiClient from '../api';
import { ApiResponse } from '@/types/team';
import type { SongFormResponse, SongFormUpdateRequest } from '@/types/song';

/**
 * Song Form API
 */

// Get song form for a team song
export async function getSongForm(teamId: string, teamSongId: string): Promise<SongFormResponse> {
    const { data } = await apiClient.get<ApiResponse<SongFormResponse>>(
        `/api/v1/teams/${teamId}/songs/${teamSongId}/form`
    );
    return data.data;
}

// Update song form for a team song
export async function updateSongForm(
    teamId: string,
    teamSongId: string,
    request: SongFormUpdateRequest
): Promise<SongFormResponse> {
    const { data } = await apiClient.put<ApiResponse<SongFormResponse>>(
        `/api/v1/teams/${teamId}/songs/${teamSongId}/form`,
        request
    );
    return data.data;
}
