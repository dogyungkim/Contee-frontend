import apiClient from '../api';
import { ApiResponse } from '@/types/team';
import type { Conti, ContiSong, CreateContiRequest, UpdateContiRequest, AddContiSongRequest, UpdateContiSongRequest, ReorderContiSongsRequest } from '@/types/conti';

/**
 * Conti API
 */

// Get all contis (Paginated)
export async function getContis(page = 0, size = 20): Promise<{ content: Conti[], totalPages: number, totalElements: number }> {
    const { data } = await apiClient.get<ApiResponse<{ content: Conti[], totalPages: number, totalElements: number }>>(`/api/v1/contis`, {
        params: { page, size }
    });
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

// Update conti (Partial update with song list replacement)
export async function updateConti(contiId: string, request: UpdateContiRequest): Promise<Conti> {
    const { data } = await apiClient.patch<ApiResponse<Conti>>(`/api/v1/contis/${contiId}`, request);
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

// Update conti song (key, bpm, note overrides, form)
export async function updateContiSong(
    contiId: string,
    contiSongId: string,
    request: UpdateContiSongRequest
): Promise<ContiSong> {
    const { data } = await apiClient.patch<ApiResponse<ContiSong>>(`/api/v1/contis/${contiId}/songs/${contiSongId}`, request);
    return data.data;
}

// Reorder conti songs
export async function reorderContiSongs(
    contiId: string,
    request: ReorderContiSongsRequest
): Promise<void> {
    await apiClient.put<ApiResponse<void>>(`/api/v1/contis/${contiId}/songs/order`, request);
}
