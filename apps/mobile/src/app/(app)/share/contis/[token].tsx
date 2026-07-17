import { useLocalSearchParams } from 'expo-router'
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native'

import {
  ContiInfoBlock,
  ContiReadCard,
  ContiSongList,
} from '@/components/conti-read-card'
import { ScreenPlaceholder } from '@/components/screen-placeholder'
import { useMobileSharedConti } from '@/lib/conti-read'
import { colors, spacing, typography } from '@/theme'

export default function SharedContiScreen() {
  const { token } = useLocalSearchParams<{ token: string }>()
  const shareToken = typeof token === 'string' ? token : null
  const sharedContiQuery = useMobileSharedConti(shareToken)

  if (!shareToken) {
    return (
      <ScreenPlaceholder
        eyebrow="External Share"
        title="공유 콘티"
        description="공유 토큰이 없어 콘티를 표시할 수 없습니다."
      />
    )
  }

  if (sharedContiQuery.isPending) {
    return (
      <ScreenPlaceholder
        eyebrow="External Share"
        title="공유 콘티"
        description="공유 콘티를 불러오는 중입니다."
      />
    )
  }

  if (sharedContiQuery.isError) {
    return (
      <ScreenPlaceholder
        eyebrow="External Share"
        title="공유 콘티"
        description="공유 콘티를 불러오지 못했습니다."
        action={
          <Pressable
            accessibilityRole="button"
            onPress={() => void sharedContiQuery.refetch()}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>
              {sharedContiQuery.isFetching ? '다시 시도 중...' : '다시 시도'}
            </Text>
          </Pressable>
        }
      />
    )
  }

  const sharedConti = sharedContiQuery.data

  return (
    <ScrollView
      style={styles.safeArea}
      contentContainerStyle={styles.container}
    >
      <Text style={styles.eyebrow}>External Share</Text>
      <Text accessibilityRole="header" style={styles.title}>
        공유 콘티
      </Text>
      <ContiReadCard conti={sharedConti} />
      <ContiInfoBlock conti={sharedConti} />
      <Text style={styles.sectionTitle}>곡 목록</Text>
      <ContiSongList songs={sharedConti.contiSongs} />
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
  sectionTitle: {
    ...typography.label,
    color: colors.neutral950,
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
