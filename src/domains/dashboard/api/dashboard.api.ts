import apiClient from '@/lib/api';
import type { ApiResponse } from '@/types/api';
import type {
  DashboardData,
} from '@/domains/dashboard/models/dashboard';
import type {
  DashboardDataDto,
} from '@/domains/dashboard/api/dashboard.dto';
import {
  toDashboardDataModel,
} from '@/domains/dashboard/api/dashboard.mapper';

export const getDashboardData = async (teamId: string): Promise<DashboardData> => {
  const response = await apiClient.get<ApiResponse<DashboardDataDto>>(`/api/v1/teams/${teamId}/dashboard`);
  return toDashboardDataModel(response.data.data);
};
