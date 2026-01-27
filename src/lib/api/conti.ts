import apiClient from '../api';
import { ApiResponse } from '@/types/team';
import type { Conti, ContiSong, CreateContiRequest, UpdateContiRequest, AddContiSongRequest } from '@/types/conti';

/**
 * Conti API
 */

// Get all contis for a team
export async function getTeamContis(teamId: string): Promise<Conti[]> {
    const { data } = await apiClient.get<ApiResponse<Conti[]>>(`/api/v1/teams/${teamId}/contis`);
    return data.data;
}

// Get single conti
export async function getConti(contiId: string): Promise<Conti> {
    const { data } = await apiClient.get<ApiResponse<Conti>>(`/api/v1/contis/${contiId}`);
    return data.data;
}

// Create conti
export async function createConti(request: CreateContiRequest): Promise<Conti> {
    const { data } = await apiClient.post<ApiResponse<Conti>>(`/api/v1/contis`, request);
    return data.data;
}

// Update conti (full update - basic info + song list)
export async function updateConti(contiId: string, request: UpdateContiRequest): Promise<Conti> {
    const { data } = await apiClient.put<ApiResponse<Conti>>(`/api/v1/contis/${contiId}`, request);
    return data.data;
}

// Delete conti
export async function deleteConti(contiId: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/api/v1/contis/${contiId}`);
}

/**
 * ContiSong API
 */

// Add song to conti
export async function addContiSong(contiId: string, request: AddContiSongRequest): Promise<ContiSong> {
    const { data } = await apiClient.post<ApiResponse<ContiSong>>(`/api/v1/contis/${contiId}/songs`, request);
    return data.data;
}

// Remove song from conti
export async function removeContiSong(contiId: string, contiSongId: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/api/v1/contis/${contiId}/songs/${contiSongId}`);
}

// Update conti song (order, note, key, bpm)
export async function updateContiSong(
    contiId: string,
    contiSongId: string,
    request: Partial<AddContiSongRequest>
): Promise<ContiSong> {
    const { data } = await apiClient.patch<ApiResponse<ContiSong>>(`/api/v1/contis/${contiId}/songs/${contiSongId}`, request);
    return data.data;
}
// Reorder conti songs
export async function reorderContiSongs(
    contiId: string,
    songIds: string[]
): Promise<void> {
    await apiClient.put<ApiResponse<void>>(`/api/v1/contis/${contiId}/songs/order`, {
        contiSongIds: songIds
    });
}
