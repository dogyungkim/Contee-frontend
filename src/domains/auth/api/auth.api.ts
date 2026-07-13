import apiClient from '@/lib/api';
import type { ApiResponse } from '@/types/api';
import type { AuthResponse, User } from '@/domains/auth/models/auth';
import type { AuthResponseDto, UserDto } from '@/domains/auth/api/auth.dto';
import { toAuthResponseModel, toUserModel } from '@/domains/auth/api/auth.mapper';

export const getGoogleLoginUrl = (): string => {
  return `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/google`;
};

export const logout = async (): Promise<void> => {
  await apiClient.post('/api/v1/auth/logout');
};

export const deleteAccount = async (): Promise<void> => {
  await apiClient.delete('/api/v1/users/me');
};

export const refreshToken = async (): Promise<AuthResponse | null> => {
  const response = await apiClient.post<ApiResponse<AuthResponseDto | null>>('/api/v1/auth/refresh', {}, {
    withCredentials: true,
  });

  return response.data.data ? toAuthResponseModel(response.data.data) : null;
};

export const getMe = async (accessToken?: string | null): Promise<User | null> => {
  if (!accessToken) return null;

  const response = await apiClient.get<ApiResponse<UserDto | null>>('/api/v1/users/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data.data ? toUserModel(response.data.data) : null;
};
