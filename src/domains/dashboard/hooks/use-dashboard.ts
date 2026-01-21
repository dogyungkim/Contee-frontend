import { useQuery } from '@tanstack/react-query';
import { getDashboardData } from '@/lib/api/dashboard';
import { useTeam } from '@/context/team-context';
import { STALE_TIME } from '@/constants/time';
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
 * 
 * IMPORTANT: This hook now reacts to team selection changes.
 * When the user selects a different team in the sidebar, the dashboard
 * data will automatically refetch for the newly selected team.
 */

export interface DashboardData {
    hasTeam: boolean;
    summary: DashboardSummary;
    recentContis: Conti[];
    songs: Song[];
    activities: Activity[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
}

// Query keys following TanStack Query best practices
export const dashboardKeys = {
    all: ['dashboard'] as const,
    data: (teamId?: string | null) => [...dashboardKeys.all, 'data', teamId] as const,
};

export function useDashboard(): DashboardData {
    // Get selected team from context
    const { teams, selectedTeamId } = useTeam();
    const hasTeam = teams.length > 0;

    // Fetch dashboard data via API (intercepted by mock adapter in dev)
    // The query key includes selectedTeamId, so changing teams will trigger a refetch
    const { data: dashboardData, isLoading, isError, error } = useQuery({
        queryKey: dashboardKeys.data(selectedTeamId),
        queryFn: getDashboardData,
        enabled: hasTeam && !!selectedTeamId, // Only fetch if user has a team and one is selected
        staleTime: STALE_TIME.FIVE_MINUTES,
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
        isLoading,
        isError,
        error,
    };
}
