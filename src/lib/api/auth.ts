import apiClient from '../api';
import { AuthResponse, User } from '@/types/auth';

/**
 * [A] API Layer (Pure Functions)
 * Constraints:
 * - Pure asynchronous functions for HTTP requests.
 * - No React Hooks or UI logic allowed here.
 */

// 1. Google OAuth Login Redirect
export const loginWithGoogle = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/google`;
};

// 2. Logout
export const logout = async (accessToken?: string | null) => {
    if (accessToken) {
        return apiClient.post('/api/v1/auth/logout', {}, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
    }
};

// 3. Token Refresh
export const refreshToken = async () => {
    const response = await apiClient.post<{
        success: boolean;
        message: string;
        data: AuthResponse | null;
    }>('/api/v1/auth/refresh', {}, {
        withCredentials: true,
    });
    return response.data;
};

// 4. Get Current User Information
export const getMe = async (accessToken?: string | null) => {
    if (!accessToken) return null;

    const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: User | null;
    }>('/api/v1/users/me', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    return response.data;
};
