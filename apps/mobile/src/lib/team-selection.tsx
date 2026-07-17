import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { TeamSummary } from '@contee/domain'
import { createTeamRepository } from '@contee/api-client'
import { contiKeys, dashboardKeys, songKeys, teamKeys } from '@contee/query'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import apiClient from './api'
import { useAuthSession } from './auth-session'
import { resolveSelectedTeamId } from './team-selection-core'

export const SELECTED_TEAM_ID_STORAGE_KEY = 'contee.mobile.selectedTeamId'

interface TeamSelectionContextValue {
  selectedTeamId: string | null
  selectedTeam: TeamSummary | null
  teams: TeamSummary[]
  isLoading: boolean
  isRefreshing: boolean
  isError: boolean
  error: Error | null
  selectTeam: (id: string) => Promise<void>
  refreshTeams: () => Promise<void>
}

const TeamSelectionContext = createContext<TeamSelectionContextValue | null>(
  null
)

const teamRepository = createTeamRepository(apiClient)

async function persistSelectedTeamId(teamId: string | null) {
  if (teamId) {
    await AsyncStorage.setItem(SELECTED_TEAM_ID_STORAGE_KEY, teamId)
    return
  }

  await AsyncStorage.removeItem(SELECTED_TEAM_ID_STORAGE_KEY)
}

function resetTeamScopedQueries(
  queryClient: ReturnType<typeof useQueryClient>
) {
  void queryClient.resetQueries({ queryKey: contiKeys.lists() })
  void queryClient.resetQueries({ queryKey: songKeys.all })
  void queryClient.resetQueries({ queryKey: dashboardKeys.all })
}

export function TeamSelectionProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthSession()
  const queryClient = useQueryClient()
  const previousSelectedTeamIdRef = useRef<string | null | undefined>(undefined)
  const [persistedSelectedTeamId, setPersistedSelectedTeamId] = useState<
    string | null
  >(null)
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [isPersistedSelectionLoading, setIsPersistedSelectionLoading] =
    useState(true)

  const teamsQuery = useQuery({
    queryKey: teamKeys.lists(),
    queryFn: () => teamRepository.listMine(),
    enabled: isAuthenticated,
  })

  const teams = useMemo(() => teamsQuery.data ?? [], [teamsQuery.data])

  useEffect(() => {
    let isMounted = true

    void AsyncStorage.getItem(SELECTED_TEAM_ID_STORAGE_KEY)
      .then((teamId) => {
        if (!isMounted) return
        setPersistedSelectedTeamId(teamId)
      })
      .catch(() => {
        if (!isMounted) return
        setPersistedSelectedTeamId(null)
      })
      .finally(() => {
        if (!isMounted) return
        setIsPersistedSelectionLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      setSelectedTeamId(null)
      return
    }

    if (isPersistedSelectionLoading || !teamsQuery.isSuccess) return

    const resolvedTeamId = resolveSelectedTeamId(teams, persistedSelectedTeamId)

    setSelectedTeamId((currentTeamId) =>
      currentTeamId === resolvedTeamId ? currentTeamId : resolvedTeamId
    )

    if (persistedSelectedTeamId !== resolvedTeamId) {
      setPersistedSelectedTeamId(resolvedTeamId)
      void persistSelectedTeamId(resolvedTeamId)
    }
  }, [
    isAuthenticated,
    isPersistedSelectionLoading,
    persistedSelectedTeamId,
    teams,
    teamsQuery.isSuccess,
  ])

  useEffect(() => {
    const previousSelectedTeamId = previousSelectedTeamIdRef.current

    if (previousSelectedTeamId === undefined) {
      previousSelectedTeamIdRef.current = selectedTeamId
      return
    }

    if (previousSelectedTeamId !== selectedTeamId) {
      resetTeamScopedQueries(queryClient)
      previousSelectedTeamIdRef.current = selectedTeamId
    }
  }, [queryClient, selectedTeamId])

  const selectTeam = useCallback(
    async (id: string) => {
      const nextTeamId = teams.some((team) => team.id === id) ? id : null

      setSelectedTeamId(nextTeamId)
      setPersistedSelectedTeamId(nextTeamId)
      await persistSelectedTeamId(nextTeamId)
    },
    [teams]
  )

  const refreshTeams = useCallback(async () => {
    await teamsQuery.refetch()
  }, [teamsQuery])

  const selectedTeam = useMemo(
    () => teams.find((team) => team.id === selectedTeamId) ?? null,
    [selectedTeamId, teams]
  )

  const value = useMemo(
    () => ({
      selectedTeamId,
      selectedTeam,
      teams,
      isLoading:
        isAuthenticated &&
        (isPersistedSelectionLoading || teamsQuery.isPending),
      isRefreshing: teamsQuery.isRefetching,
      isError: teamsQuery.isError,
      error: teamsQuery.error,
      selectTeam,
      refreshTeams,
    }),
    [
      isAuthenticated,
      isPersistedSelectionLoading,
      refreshTeams,
      selectTeam,
      selectedTeam,
      selectedTeamId,
      teams,
      teamsQuery.error,
      teamsQuery.isError,
      teamsQuery.isPending,
      teamsQuery.isRefetching,
    ]
  )

  return (
    <TeamSelectionContext.Provider value={value}>
      {children}
    </TeamSelectionContext.Provider>
  )
}

export function useTeamSelection() {
  const context = useContext(TeamSelectionContext)

  if (!context) {
    throw new Error(
      'useTeamSelection must be used within TeamSelectionProvider.'
    )
  }

  return context
}
