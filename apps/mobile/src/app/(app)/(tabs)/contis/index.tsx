import { router } from 'expo-router'
import { getApiErrorMessage } from '@contee/api-client'
import { useState } from 'react'
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'

import { ContiReadCard } from '@/components/conti-read-card'
import { ListLoadingSkeleton } from '@/components/list-loading-skeleton'
import { ScreenPlaceholder } from '@/components/screen-placeholder'
import { TeamSelectionTrigger } from '@/components/team-selection-modal'
import { useMobileContis } from '@/lib/conti-read'
import { useTeamSelection } from '@/lib/team-selection'
import { colors, spacing, typography } from '@/theme'

export default function ContisScreen() {
  const [filters, setFilters] = useState({ q: '', from: '', to: '' })
  const [appliedFilters, setAppliedFilters] = useState(filters)
  const {
    isLoading: isTeamLoading,
    selectedTeam,
    selectedTeamId,
  } = useTeamSelection()
  const contisQuery = useMobileContis(selectedTeamId, appliedFilters)

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

  const contis = contisQuery.data?.pages.flatMap((page) => page.content) ?? []

  function resetFilters() {
    const emptyFilters = { q: '', from: '', to: '' }
    setFilters(emptyFilters)
    setAppliedFilters(emptyFilters)
  }

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
      <Text accessibilityRole="header" style={styles.title}>
        콘티
      </Text>
      <Text style={styles.description}>
        {selectedTeam?.name ?? '선택된 팀'} 팀의 콘티를 확인하고 새 콘티를
        만드세요.
      </Text>
      <Pressable
        accessibilityLabel="새 콘티 만들기"
        accessibilityRole="button"
        onPress={() => router.push('/contis/new')}
        style={styles.createButton}
      >
        <Text style={styles.createButtonText}>새 콘티 만들기</Text>
      </Pressable>
      <View style={styles.filters}>
        <TextInput
          accessibilityLabel="콘티 검색어"
          autoCorrect={false}
          onChangeText={(q) => setFilters((current) => ({ ...current, q }))}
          placeholder="콘티 제목 검색"
          placeholderTextColor={colors.neutral500}
          style={styles.input}
          value={filters.q}
        />
        <View style={styles.dateFilters}>
          <TextInput
            accessibilityLabel="시작 날짜"
            keyboardType="numbers-and-punctuation"
            maxLength={10}
            onChangeText={(from) =>
              setFilters((current) => ({ ...current, from }))
            }
            placeholder="시작일 (YYYY-MM-DD)"
            placeholderTextColor={colors.neutral500}
            style={styles.dateInput}
            value={filters.from}
          />
          <TextInput
            accessibilityLabel="종료 날짜"
            keyboardType="numbers-and-punctuation"
            maxLength={10}
            onChangeText={(to) => setFilters((current) => ({ ...current, to }))}
            placeholder="종료일 (YYYY-MM-DD)"
            placeholderTextColor={colors.neutral500}
            style={styles.dateInput}
            value={filters.to}
          />
        </View>
        <View style={styles.filterActions}>
          <Pressable
            accessibilityLabel="콘티 필터 적용"
            accessibilityRole="button"
            onPress={() => setAppliedFilters(filters)}
            style={styles.applyButton}
          >
            <Text style={styles.applyButtonText}>적용</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="콘티 필터 초기화"
            accessibilityRole="button"
            onPress={resetFilters}
            style={styles.resetButton}
          >
            <Text style={styles.resetButtonText}>초기화</Text>
          </Pressable>
        </View>
      </View>
      {contisQuery.isPending ? (
        <ListLoadingSkeleton />
      ) : contisQuery.isError ? (
        <View style={styles.stateBlock}>
          <Text style={styles.errorText}>
            {getApiErrorMessage(contisQuery.error)}
          </Text>
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
          {contisQuery.hasNextPage ? (
            <Pressable
              accessibilityLabel="콘티 더 보기"
              accessibilityRole="button"
              accessibilityState={{ disabled: contisQuery.isFetchingNextPage }}
              disabled={contisQuery.isFetchingNextPage}
              onPress={() => void contisQuery.fetchNextPage()}
              style={styles.moreButton}
            >
              <Text style={styles.moreButtonText}>
                {contisQuery.isFetchingNextPage ? '불러오는 중...' : '더 보기'}
              </Text>
            </Pressable>
          ) : null}
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
  title: {
    ...typography.title,
    color: colors.neutral950,
  },
  description: {
    ...typography.body,
    color: colors.neutral600,
  },
  createButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.neutral950,
    paddingHorizontal: spacing.lg,
  },
  createButtonText: {
    ...typography.label,
    color: colors.white,
  },
  list: {
    gap: spacing.md,
  },
  filters: {
    gap: spacing.sm,
  },
  dateFilters: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  input: {
    ...typography.body,
    minHeight: 48,
    borderRadius: 8,
    borderColor: colors.neutral300,
    borderWidth: 1,
    backgroundColor: colors.white,
    color: colors.neutral950,
    paddingHorizontal: spacing.md,
  },
  dateInput: {
    ...typography.body,
    flex: 1,
    minHeight: 48,
    borderRadius: 8,
    borderColor: colors.neutral300,
    borderWidth: 1,
    backgroundColor: colors.white,
    color: colors.neutral950,
    paddingHorizontal: spacing.sm,
  },
  filterActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  applyButton: {
    minHeight: 44,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.neutral950,
  },
  applyButtonText: {
    ...typography.label,
    color: colors.white,
  },
  resetButton: {
    minHeight: 44,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderColor: colors.neutral300,
    borderWidth: 1,
  },
  resetButtonText: {
    ...typography.label,
    color: colors.neutral950,
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
    borderRadius: 8,
    borderColor: colors.neutral300,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
  },
  retryButtonText: {
    ...typography.label,
    color: colors.neutral950,
  },
  moreButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderColor: colors.neutral300,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
  },
  moreButtonText: {
    ...typography.label,
    color: colors.neutral950,
  },
})
