import apiClient from '@/lib/api';
import type { ApiResponse } from '@/types/api';
import type {
  Activity,
  DashboardData,
  DashboardSummary,
} from '@/domains/dashboard/models/dashboard';
import type {
  ActivityDto,
  DashboardDataDto,
  DashboardSummaryDto,
} from '@/domains/dashboard/api/dashboard.dto';
import {
  toActivityModel,
  toDashboardDataModel,
  toDashboardSummaryModel,
} from '@/domains/dashboard/api/dashboard.mapper';
import { toContiModel } from '@/domains/conti/api/conti.mapper';

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const response = await apiClient.get<ApiResponse<DashboardSummaryDto>>('/api/v1/dashboard/summary');
  return toDashboardSummaryModel(response.data.data);
};

export const getRecentContis = async () => {
  const response = await apiClient.get<ApiResponse<DashboardDataDto['recentContis']>>('/api/v1/dashboard/contis/recent');
  return response.data.data.map(toContiModel);
};

export const getSongs = async () => {
  const response = await apiClient.get<ApiResponse<DashboardDataDto['songs']>>('/api/v1/dashboard/songs');
  return response.data.data;
};

export const getActivities = async (): Promise<Activity[]> => {
  const response = await apiClient.get<ApiResponse<ActivityDto[]>>('/api/v1/dashboard/activities');
  return response.data.data.map(toActivityModel);
};

export const getDashboardData = async (teamId: string): Promise<DashboardData> => {
  const response = await apiClient.get<ApiResponse<DashboardDataDto>>(`/api/v1/teams/${teamId}/dashboard`);
  return toDashboardDataModel(response.data.data);
};
