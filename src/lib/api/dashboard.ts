import apiClient from '../api';
import type { DashboardSummary, Conti, Song, Activity } from '@/lib/mock/data';

/**
 * [A] API Layer - Dashboard
 * Pure asynchronous functions for HTTP requests
 * No React Hooks or UI logic allowed here
 */

export interface DashboardData {
    summary: DashboardSummary;
    recentContis: Conti[];
    songs: Song[];
    activities: Activity[];
}

/**
 * Get dashboard summary statistics
 */
export const getDashboardSummary = async (): Promise<DashboardSummary> => {
    const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: DashboardSummary;
    }>('/api/v1/dashboard/summary');
    return response.data.data;
};

/**
 * Get recent contis
 */
export const getRecentContis = async (): Promise<Conti[]> => {
    const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: Conti[];
    }>('/api/v1/dashboard/contis/recent');
    return response.data.data;
};

/**
 * Get song library
 */
export const getSongs = async (): Promise<Song[]> => {
    const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: Song[];
    }>('/api/v1/dashboard/songs');
    return response.data.data;
};

/**
 * Get recent activities
 */
export const getActivities = async (): Promise<Activity[]> => {
    const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: Activity[];
    }>('/api/v1/dashboard/activities');
    return response.data.data;
};

/**
 * Get all dashboard data in one call
 */
export const getDashboardData = async (): Promise<DashboardData> => {
    const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: DashboardData;
    }>('/api/v1/dashboard');
    return response.data.data;
};
