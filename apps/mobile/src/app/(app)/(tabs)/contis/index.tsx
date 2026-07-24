import { router } from 'expo-router'
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { ContiReadCard } from '@/components/conti-read-card'
import { ScreenPlaceholder } from '@/components/screen-placeholder'
import { TeamSelectionTrigger } from '@/components/team-selection-modal'
import { useMobileContis } from '@/lib/conti-read'
import { useTeamSelection } from '@/lib/team-selection'
import { colors, spacing, typography } from '@/theme'

export default function ContisScreen() {
  const {
    isLoading: isTeamLoading,
    selectedTeam,
    selectedTeamId,
  } = useTeamSelection()
  const contisQuery = useMobileContis(selectedTeamId)

  if (!selectedTeamId) {
    return (
      <ScreenPlaceholder
        eyebrow="Read-only MVP"
        title="콘티"
        description={
          isTeamLoading
            ? '팀 정보를 불러온 뒤 콘티 목록을 연결합니다.'
            : '팀을 선택하거나 참여한 뒤 콘티 목록을 볼 수 있습니다.'
        }
        action={<TeamSelectionTrigger />}
      />
    )
  }

  const contis = contisQuery.data?.content ?? []

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          onRefresh={() => void contisQuery.refetch()}
          refreshing={contisQuery.isRefetching}
        />
      }
      style={styles.safeArea}
    >
      <Text style={styles.eyebrow}>Read-only MVP</Text>
      <Text accessibilityRole="header" style={styles.title}>
        콘티
      </Text>
      <Text style={styles.description}>
        {selectedTeam?.name ?? '선택된 팀'} 팀의 read-only 콘티 목록입니다.
      </Text>
      {contisQuery.isPending ? (
        <Text style={styles.stateText}>콘티 목록을 불러오는 중입니다.</Text>
      ) : contisQuery.isError ? (
        <View style={styles.stateBlock}>
          <Text style={styles.errorText}>콘티 목록을 불러오지 못했습니다.</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => void contisQuery.refetch()}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>
              {contisQuery.isFetching ? '다시 시도 중...' : '다시 시도'}
            </Text>
          </Pressable>
        </View>
      ) : contis.length === 0 ? (
        <Text style={styles.stateText}>아직 등록된 콘티가 없습니다.</Text>
      ) : (
        <View style={styles.list}>
          {contis.map((conti) => (
            <ContiReadCard
              conti={conti}
              key={conti.id}
              onPress={() => router.push(`/contis/${conti.id}`)}
            />
          ))}
        </View>
      )}
    </ScrollView>
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
  list: {
    gap: spacing.md,
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
