import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { TeamSummary } from '@contee/domain'
import { getApiErrorMessage } from '@contee/api-client'

import { useTeamSelection } from '@/lib/team-selection'
import { colors, spacing, typography } from '@/theme'
import { TeamSetupActions } from './team-setup-actions'

export function TeamSelectionPanel() {
  const {
    error,
    isError,
    isLoading,
    isRefreshing,
    refreshTeams,
    selectTeam,
    selectedTeamId,
    teams,
  } = useTeamSelection()

  if (isLoading) {
    return <Text style={styles.mutedText}>팀 목록을 불러오는 중입니다.</Text>
  }

  if (isError) {
    return (
      <View style={styles.panel}>
        <Text style={styles.errorText}>{getApiErrorMessage(error)}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => void refreshTeams()}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>
            {isRefreshing ? '다시 시도 중...' : '다시 시도'}
          </Text>
        </Pressable>
      </View>
    )
  }

  if (teams.length === 0) {
    return (
      <View style={styles.panel}>
        <Text style={styles.mutedText}>
          참여 중인 팀이 없습니다. 새 팀을 만들거나 초대 코드로 참여하세요.
        </Text>
        <TeamSetupActions />
      </View>
    )
  }

  return (
    <View style={styles.panel}>
      <Text style={styles.sectionTitle}>팀 선택</Text>
      {teams.map((team) => (
        <TeamButton
          isSelected={team.id === selectedTeamId}
          key={team.id}
          onSelect={() => void selectTeam(team.id)}
          team={team}
        />
      ))}
    </View>
  )
}

function TeamButton({
  isSelected,
  onSelect,
  team,
}: {
  isSelected: boolean
  onSelect: () => void
  team: TeamSummary
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      onPress={onSelect}
      style={[styles.teamButton, isSelected ? styles.selectedTeam : null]}
    >
      <Text
        style={[styles.teamName, isSelected ? styles.selectedTeamText : null]}
      >
        {team.name}
      </Text>
      {team.shortCode ? (
        <Text
          style={[styles.teamCode, isSelected ? styles.selectedTeamText : null]}
        >
          {team.shortCode}
        </Text>
      ) : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  panel: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.neutral950,
  },
  mutedText: {
    ...typography.body,
    color: colors.neutral600,
  },
  errorText: {
    ...typography.body,
    color: '#b91c1c',
  },
  teamButton: {
    minHeight: 52,
    justifyContent: 'center',
    gap: 2,
    borderRadius: 10,
    borderColor: colors.neutral300,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  selectedTeam: {
    borderColor: colors.neutral950,
    backgroundColor: colors.neutral950,
  },
  teamName: {
    ...typography.label,
    color: colors.neutral950,
  },
  teamCode: {
    ...typography.tabLabel,
    color: colors.neutral500,
  },
  selectedTeamText: {
    color: colors.white,
  },
  secondaryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderColor: colors.neutral300,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
  },
  secondaryButtonText: {
    ...typography.label,
    color: colors.neutral950,
  },
})
