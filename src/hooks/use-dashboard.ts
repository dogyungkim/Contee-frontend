import { useQuery } from '@tanstack/react-query';
import { getDashboardData } from '@/lib/api/dashboard';
import { useMyTeamsQuery } from './queries/use-team-query';
import type { DashboardSummary, Conti, Song, Activity } from '@/lib/mock/data';

/**
 * [D] Logic Layer (Custom Hooks)
 * Role: Orchestrating data access for Dashboard
 * 
 * This hook uses real API functions that are intercepted by the mock adapter.
 * When ready for production:
 * 1. Set NEXT_PUBLIC_USE_MOCK=false in .env
 * 2. The API calls will hit real endpoints automatically
 * 3. No component code changes needed!
 */

export interface DashboardData {
    hasTeam: boolean;
    summary: DashboardSummary;
    recentContis: Conti[];
    songs: Song[];
    activities: Activity[];
}

// Query keys following TanStack Query best practices
export const dashboardKeys = {
    all: ['dashboard'] as const,
    data: () => [...dashboardKeys.all, 'data'] as const,
};

export function useDashboard(): DashboardData {
    // Check if user has a team
    const { data: teams } = useMyTeamsQuery();
    const hasTeam = (teams?.length ?? 0) > 0;

    // Fetch dashboard data via API (intercepted by mock adapter in dev)
    const { data: dashboardData } = useQuery({
        queryKey: dashboardKeys.data(),
        queryFn: getDashboardData,
        enabled: hasTeam, // Only fetch if user has a team
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    return {
        hasTeam,
        summary: dashboardData?.summary ?? {
            nextServiceLabel: '',
            nextServiceDateLabel: '',
            thisWeekContiCount: 0,
            totalSongCount: 0,
        },
        recentContis: dashboardData?.recentContis ?? [],
        songs: dashboardData?.songs ?? [],
        activities: dashboardData?.activities ?? [],
    };
}
