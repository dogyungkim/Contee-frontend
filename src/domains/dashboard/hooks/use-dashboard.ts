import { dashboardKeys } from '@contee/query'
import { useQuery } from '@tanstack/react-query'
import { getDashboardData } from '@/domains/dashboard/api/dashboard.api'
import { useTeam } from '@/context/team-context'
import { STALE_TIME } from '@/constants/time'
import type {
  DashboardSummary,
  Activity,
  DashboardConti,
} from '@/domains/dashboard/models/dashboard'
import type { Song } from '@/types/song'

/**
 * [D] Logic Layer (Custom Hooks)
 * Role: Orchestrating data access for Dashboard
 *
 * IMPORTANT: This hook now reacts to team selection changes.
 * When the user selects a different team in the sidebar, the dashboard
 * data will automatically refetch for the newly selected team.
 */

export interface DashboardData {
  hasTeam: boolean
  summary: DashboardSummary
  recentContis: DashboardConti[]
  songs: Song[]
  activities: Activity[]
  isLoading: boolean
  isError: boolean
  error: Error | null
}

// Query keys following TanStack Query best practices
export { dashboardKeys }

export function useDashboard(): DashboardData {
  // Get selected team from context
  const { teams, selectedTeamId } = useTeam()
  const hasTeam = teams.length > 0

  // The query key includes selectedTeamId, so changing teams will trigger a refetch
  const {
    data: dashboardData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: dashboardKeys.data(selectedTeamId),
    queryFn: () => getDashboardData(selectedTeamId!),
    enabled: hasTeam && !!selectedTeamId, // Only fetch if user has a team and one is selected
    staleTime: STALE_TIME.FIVE_MINUTES,
  })

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
  }
}
