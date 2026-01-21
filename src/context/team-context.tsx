'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import { useMyTeamsQuery } from '@/domains/team/hooks/use-team-query'
import { Team } from '@/types/team'

interface TeamContextType {
  selectedTeamId: string | null
  setSelectedTeamId: (id: string | null) => void
  selectedTeam: Team | null
  teams: Team[]
  isLoading: boolean
}

const TeamContext = createContext<TeamContextType | undefined>(undefined)

export function TeamProvider({ children }: { children: ReactNode }) {
  const { data: teams = [], isLoading } = useMyTeamsQuery()
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const searchParams = useSearchParams()

  // Initialize with teamId from URL or first team when teams load
  useEffect(() => {
    if (teams.length > 0 && !selectedTeamId) {
      const urlTeamId = searchParams.get('teamId')
      if (urlTeamId && teams.some(t => t.id === urlTeamId)) {
        setSelectedTeamId(urlTeamId)
      } else {
        setSelectedTeamId(teams[0].id)
      }
    }
  }, [teams, selectedTeamId, searchParams])

  // Find the selected team object
  const selectedTeam = teams.find(team => team.id === selectedTeamId) || null

  return (
    <TeamContext.Provider
      value={{
        selectedTeamId,
        setSelectedTeamId,
        selectedTeam,
        teams,
        isLoading,
      }}
    >
      {children}
    </TeamContext.Provider>
  )
}

export function useTeam() {
  const context = useContext(TeamContext)
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider')
  }
  return context
}
