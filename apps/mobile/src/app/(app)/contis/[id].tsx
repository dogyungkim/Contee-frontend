import { useLocalSearchParams } from 'expo-router'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

import {
  ContiInfoBlock,
  ContiReadCard,
  ContiSongList,
} from '@/components/conti-read-card'
import { ScreenPlaceholder } from '@/components/screen-placeholder'
import { useMobileContiDetail } from '@/lib/conti-read'
import { colors, spacing, typography } from '@/theme'

export default function ContiDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const contiId = typeof id === 'string' ? id : null
  const contiQuery = useMobileContiDetail(contiId)

  if (!contiId) {
    return (
      <ScreenPlaceholder
        eyebrow="Conti Detail"
        title="콘티 상세"
        description="콘티 ID가 없어 상세를 표시할 수 없습니다."
      />
    )
  }

  if (contiQuery.isPending) {
    return (
      <ScreenPlaceholder
        eyebrow="Conti Detail"
        title="콘티 상세"
        description="콘티 상세를 불러오는 중입니다."
      />
    )
  }

  if (contiQuery.isError) {
    return (
      <ScreenPlaceholder
        eyebrow="Conti Detail"
        title="콘티 상세"
        description="콘티 상세를 불러오지 못했습니다."
        action={
          <Pressable
            accessibilityRole="button"
            onPress={() => void contiQuery.refetch()}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>
              {contiQuery.isFetching ? '다시 시도 중...' : '다시 시도'}
            </Text>
          </Pressable>
        }
      />
    )
  }

  const conti = contiQuery.data

  return (
    <ScrollView
      style={styles.safeArea}
      contentContainerStyle={styles.container}
    >
      <Text style={styles.eyebrow}>Conti Detail</Text>
      <Text accessibilityRole="header" style={styles.title}>
        콘티 상세
      </Text>
      <ContiReadCard conti={conti} />
      <ContiInfoBlock conti={conti} />
      <Text style={styles.sectionTitle}>곡 목록</Text>
      <ContiSongList songs={conti.contiSongs ?? []} />
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
