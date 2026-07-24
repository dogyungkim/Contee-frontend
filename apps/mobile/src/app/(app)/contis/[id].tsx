import { getApiErrorMessage } from '@contee/api-client'
import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import {
  ContiInfoBlock,
  ContiReadCard,
  ContiSongList,
} from '@/components/conti-read-card'
import { ScreenPlaceholder } from '@/components/screen-placeholder'
import { useMobileContiDetail } from '@/lib/conti-read'
import {
  useMobilePublishConti,
  useMobileRemoveConti,
} from '@/lib/conti-mutations'
import { getContiPermissions } from '@/lib/conti-permissions-core'
import { useNetworkStatus } from '@/lib/query-client'
import { useMobileTeamMembers } from '@/lib/team-read'
import { useAuthSession } from '@/lib/auth-session'
import { colors, spacing, typography } from '@/theme'

export default function ContiDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const contiId = typeof id === 'string' ? id : null
  const contiQuery = useMobileContiDetail(contiId)
  const [actionError, setActionError] = useState<string | null>(null)
  const { isNetworkAvailable } = useNetworkStatus()
  const { user } = useAuthSession()
  const membersQuery = useMobileTeamMembers(contiQuery.data?.teamId ?? null)
  const publishConti = useMobilePublishConti()
  const removeConti = useMobileRemoveConti()

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
        description={getApiErrorMessage(contiQuery.error)}
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
  const isMutating = publishConti.isPending || removeConti.isPending
  const permissions = getContiPermissions({
    conti,
    currentUserId: user?.id ?? null,
    members: membersQuery.isSuccess ? membersQuery.data : undefined,
  })

  const publish = async () => {
    if (!permissions.canPublish) {
      setActionError('이 콘티를 발행할 권한이 없습니다.')
      return
    }
    setActionError(null)
    try {
      await publishConti.mutateAsync({ id: conti.id, teamId: conti.teamId })
    } catch (requestError) {
      setActionError(getApiErrorMessage(requestError))
    }
  }

  const remove = async () => {
    if (!permissions.canDelete) {
      setActionError('이 콘티를 삭제할 권한이 없습니다.')
      return
    }
    setActionError(null)
    try {
      await removeConti.mutateAsync({ id: conti.id, teamId: conti.teamId })
      router.replace('/contis')
    } catch (requestError) {
      setActionError(getApiErrorMessage(requestError))
    }
  }

  const confirmPublish = () => {
    Alert.alert('콘티를 발행할까요?', '발행한 콘티는 팀에 공유됩니다.', [
      { text: '취소', style: 'cancel' },
      { text: '발행', onPress: () => void publish() },
    ])
  }

  const confirmRemove = () => {
    Alert.alert('콘티를 삭제할까요?', '삭제한 콘티는 복구할 수 없습니다.', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => void remove() },
    ])
  }

  return (
    <ScrollView
      style={styles.safeArea}
      contentContainerStyle={styles.container}
    >
      <Text style={styles.eyebrow}>Conti Detail</Text>
      <Text accessibilityRole="header" style={styles.title}>
        콘티 상세
      </Text>
      {!permissions.isResolved ? (
        <Text style={styles.offlineText}>
          {membersQuery.isError
            ? '권한 정보를 확인할 수 없어 콘티 작업을 제한했습니다.'
            : '콘티 작업 권한을 확인하는 중입니다.'}
        </Text>
      ) : permissions.canEdit ? (
        <View style={styles.actions}>
          <Pressable
            accessibilityLabel="콘티 편집"
            accessibilityRole="button"
            accessibilityState={{ disabled: isMutating }}
            disabled={isMutating}
            onPress={() => router.push(`/contis/${conti.id}/edit`)}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>편집</Text>
          </Pressable>
          {permissions.canPublish ? (
            <Pressable
              accessibilityLabel="콘티 발행"
              accessibilityRole="button"
              accessibilityState={{
                disabled: !isNetworkAvailable || isMutating,
              }}
              disabled={!isNetworkAvailable || isMutating}
              onPress={confirmPublish}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>
                {publishConti.isPending ? '발행 중...' : '발행'}
              </Text>
            </Pressable>
          ) : null}
          <Pressable
            accessibilityLabel="콘티 삭제"
            accessibilityRole="button"
            accessibilityState={{ disabled: !isNetworkAvailable || isMutating }}
            disabled={!isNetworkAvailable || isMutating}
            onPress={confirmRemove}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteButtonText}>
              {removeConti.isPending ? '삭제 중...' : '삭제'}
            </Text>
          </Pressable>
        </View>
      ) : (
        <Text style={styles.offlineText}>
          이 콘티를 수정하거나 삭제할 권한이 없습니다.
        </Text>
      )}
      {!isNetworkAvailable ? (
        <Text style={styles.offlineText}>
          오프라인 상태에서는 발행하거나 삭제할 수 없습니다.
        </Text>
      ) : null}
      {actionError ? (
        <Text accessibilityRole="alert" style={styles.errorText}>
          {actionError}
        </Text>
      ) : null}
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
  actions: { flexDirection: 'row', gap: spacing.sm },
  primaryButton: {
    minHeight: 44,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.neutral950,
  },
  primaryButtonText: { ...typography.label, color: colors.white },
  secondaryButton: {
    minHeight: 44,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderColor: colors.neutral300,
    borderWidth: 1,
  },
  secondaryButtonText: { ...typography.label, color: colors.neutral950 },
  deleteButton: {
    minHeight: 44,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderColor: colors.error,
    borderWidth: 1,
  },
  deleteButtonText: { ...typography.label, color: colors.error },
  offlineText: { ...typography.body, color: colors.neutral600 },
  errorText: { ...typography.body, color: colors.error },
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
})
