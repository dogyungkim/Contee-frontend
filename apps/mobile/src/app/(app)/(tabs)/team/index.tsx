import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import type { Team, TeamMember, TeamRole, TeamSummary } from '@contee/domain'

import { TeamSelectionTrigger } from '@/components/team-selection-modal'
import { useMobileTeamRead } from '@/lib/team-read'
import { useTeamSelection } from '@/lib/team-selection'
import { colors, spacing, typography } from '@/theme'

const ROLE_LABELS: Record<TeamRole, string> = {
  OWNER: '소유자',
  ADMIN: '관리자',
  MEMBER: '멤버',
  VIEWER: '보기 전용',
}

export default function TeamScreen() {
  const {
    isLoading: isTeamSelectionLoading,
    selectedTeam,
    selectedTeamId,
  } = useTeamSelection()
  const { membersQuery, teamQuery } = useMobileTeamRead(selectedTeamId)

  if (!selectedTeamId) {
    return (
      <ScrollView
        contentContainerStyle={styles.container}
        style={styles.safeArea}
      >
        <Text style={styles.eyebrow}>Read-only MVP</Text>
        <Text accessibilityRole="header" style={styles.title}>
          팀
        </Text>
        <Text style={styles.description}>
          {isTeamSelectionLoading
            ? '팀 정보를 불러오고 있습니다.'
            : '팀을 선택하거나 참여한 뒤 팀 요약과 멤버 목록을 볼 수 있습니다.'}
        </Text>
        <TeamSelectionTrigger />
      </ScrollView>
    )
  }

  const team = teamQuery.data
  const members = membersQuery.data ?? []

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      style={styles.safeArea}
    >
      <Text style={styles.eyebrow}>Read-only MVP</Text>
      <Text accessibilityRole="header" style={styles.title}>
        팀
      </Text>
      <Text style={styles.description}>
        {selectedTeam?.name ?? '선택된 팀'}의 요약과 멤버 목록을 read-only로
        확인합니다.
      </Text>
      <View style={styles.section}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          팀 요약
        </Text>
        {teamQuery.isPending ? (
          <Text style={styles.stateText}>팀 요약을 불러오는 중입니다.</Text>
        ) : teamQuery.isError ? (
          <ErrorState
            isRetrying={teamQuery.isFetching}
            message="팀 요약을 불러오지 못했습니다."
            onRetry={() => void teamQuery.refetch()}
          />
        ) : (
          <TeamSummaryCard selectedTeam={selectedTeam} team={team} />
        )}
      </View>

      <View style={styles.section}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          멤버
        </Text>
        {membersQuery.isPending ? (
          <Text style={styles.stateText}>멤버 목록을 불러오는 중입니다.</Text>
        ) : membersQuery.isError ? (
          <ErrorState
            isRetrying={membersQuery.isFetching}
            message="멤버 목록을 불러오지 못했습니다."
            onRetry={() => void membersQuery.refetch()}
          />
        ) : members.length === 0 ? (
          <Text style={styles.stateText}>아직 표시할 멤버가 없습니다.</Text>
        ) : (
          <View style={styles.list}>
            {members.map((member) => (
              <MemberRow key={member.id} member={member} />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  )
}

function TeamSummaryCard({
  selectedTeam,
  team,
}: {
  selectedTeam: TeamSummary | null
  team: Team | undefined
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>
        {team?.name ?? selectedTeam?.name ?? '이름 없는 팀'}
      </Text>
      {team?.description ? (
        <Text style={styles.cardDescription}>{team.description}</Text>
      ) : null}
      <View style={styles.metaGrid}>
        <MetaItem label="초대 코드" value={team?.shortCode ?? '없음'} />
        <MetaItem
          label="멤버 수"
          value={
            typeof team?.memberCount === 'number'
              ? `${team.memberCount}명`
              : '확인 중'
          }
        />
      </View>
    </View>
  )
}

function MemberRow({ member }: { member: TeamMember }) {
  return (
    <View style={styles.memberRow}>
      <View style={styles.memberAvatar} accessible={false}>
        <Text style={styles.memberAvatarText}>
          {member.userName.slice(0, 1).toUpperCase()}
        </Text>
      </View>
      <View style={styles.memberTextBlock}>
        <Text style={styles.memberName}>{member.userName}</Text>
        <Text style={styles.memberEmail}>{member.userEmail}</Text>
      </View>
      <Text style={styles.roleBadge}>{ROLE_LABELS[member.role]}</Text>
    </View>
  )
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  )
}

function ErrorState({
  isRetrying,
  message,
  onRetry,
}: {
  isRetrying: boolean
  message: string
  onRetry: () => void
}) {
  return (
    <View style={styles.stateBlock}>
      <Text style={styles.errorText}>{message}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        style={styles.retryButton}
      >
        <Text style={styles.retryButtonText}>
          {isRetrying ? '다시 시도 중...' : '다시 시도'}
        </Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.neutral50,
  },
  container: {
    gap: spacing.md,
    padding: spacing.xl,
  },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.neutral500,
  },
  title: {
    ...typography.title,
    color: colors.neutral950,
  },
  description: {
    ...typography.body,
    color: colors.neutral600,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.neutral950,
  },
  card: {
    gap: spacing.sm,
    borderRadius: 14,
    borderColor: colors.neutral300,
    borderWidth: 1,
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  cardTitle: {
    ...typography.label,
    color: colors.neutral950,
  },
  cardDescription: {
    ...typography.body,
    color: colors.neutral600,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metaItem: {
    minWidth: 120,
    gap: 2,
  },
  metaLabel: {
    ...typography.tabLabel,
    color: colors.neutral500,
  },
  metaValue: {
    ...typography.label,
    color: colors.neutral800,
  },
  list: {
    gap: spacing.sm,
  },
  memberRow: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: 14,
    borderColor: colors.neutral300,
    borderWidth: 1,
    backgroundColor: colors.white,
    padding: spacing.md,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.neutral100,
  },
  memberAvatarText: {
    ...typography.label,
    color: colors.neutral800,
  },
  memberTextBlock: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  memberName: {
    ...typography.label,
    color: colors.neutral950,
  },
  memberEmail: {
    ...typography.tabLabel,
    color: colors.neutral500,
  },
  roleBadge: {
    ...typography.tabLabel,
    borderRadius: 999,
    backgroundColor: colors.neutral100,
    color: colors.neutral800,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  stateBlock: {
    gap: spacing.sm,
  },
  stateText: {
    ...typography.body,
    color: colors.neutral600,
  },
  errorText: {
    ...typography.body,
    color: '#b91c1c',
  },
  retryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderColor: colors.neutral300,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
  },
  retryButtonText: {
    ...typography.label,
    color: colors.neutral950,
  },
})
