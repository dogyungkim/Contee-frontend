import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import type { TeamSong } from '@contee/domain'
import { getApiErrorMessage } from '@contee/api-client'
import { router } from 'expo-router'

import { ListLoadingSkeleton } from '@/components/list-loading-skeleton'
import { ScreenPlaceholder } from '@/components/screen-placeholder'
import { TeamSelectionTrigger } from '@/components/team-selection-modal'
import { useAuthSession } from '@/lib/auth-session'
import { canEditSongs } from '@/lib/song-permissions-core'
import { useMobileSongs } from '@/lib/song-read'
import { useTeamSelection } from '@/lib/team-selection'
import { useMobileTeamMembers } from '@/lib/team-read'
import { colors, spacing, typography } from '@/theme'

export default function SongsScreen() {
  const {
    isLoading: isTeamLoading,
    selectedTeam,
    selectedTeamId,
  } = useTeamSelection()
  const songsQuery = useMobileSongs(selectedTeamId)
  const { user } = useAuthSession()
  const membersQuery = useMobileTeamMembers(selectedTeamId)

  if (!selectedTeamId) {
    return (
      <ScreenPlaceholder
        eyebrow="Read-only MVP"
        title="곡"
        description={
          isTeamLoading
            ? '팀 정보를 불러온 뒤 곡 라이브러리를 연결합니다.'
            : '팀을 선택하거나 참여한 뒤 곡 라이브러리를 볼 수 있습니다.'
        }
        action={<TeamSelectionTrigger />}
      />
    )
  }

  const songs = songsQuery.data?.content ?? []
  const canEdit = canEditSongs(
    user?.id ?? null,
    membersQuery.isSuccess ? membersQuery.data : undefined
  )

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          onRefresh={() => void songsQuery.refetch()}
          refreshing={songsQuery.isRefetching}
        />
      }
      style={styles.safeArea}
    >
      <Text style={styles.eyebrow}>Song Library</Text>
      <Text accessibilityRole="header" style={styles.title}>
        곡
      </Text>
      <Text style={styles.description}>
        {selectedTeam?.name ?? '선택된 팀'} 팀의 곡 라이브러리입니다.
      </Text>
      {canEdit ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('./new')}
          style={styles.createButton}
        >
          <Text style={styles.createButtonText}>새 곡 등록</Text>
        </Pressable>
      ) : null}
      {songsQuery.isPending ? (
        <ListLoadingSkeleton />
      ) : songsQuery.isError ? (
        <View style={styles.stateBlock}>
          <Text style={styles.errorText}>
            {getApiErrorMessage(songsQuery.error)}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => void songsQuery.refetch()}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>
              {songsQuery.isFetching ? '다시 시도 중...' : '다시 시도'}
            </Text>
          </Pressable>
        </View>
      ) : songs.length === 0 ? (
        <Text style={styles.stateText}>아직 등록된 곡이 없습니다.</Text>
      ) : (
        <View style={styles.list}>
          {songs.map((song) => (
            <SongReadCard canEdit={canEdit} key={song.id} song={song} />
          ))}
        </View>
      )}
    </ScrollView>
  )
}

function SongReadCard({ canEdit, song }: { canEdit: boolean; song: TeamSong }) {
  const details = [
    song.keySignature ? `Key ${song.keySignature}` : null,
    typeof song.bpm === 'number' ? `${song.bpm} BPM` : null,
  ].filter(Boolean)

  return (
    <Pressable
      accessibilityRole={canEdit ? 'button' : undefined}
      disabled={!canEdit}
      onPress={() => router.push(`./${song.id}/edit`)}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTextBlock}>
          <Text style={styles.cardTitle}>{song.title}</Text>
          {song.artist ? (
            <Text style={styles.cardSubtitle}>{song.artist}</Text>
          ) : null}
        </View>
        {song.isFavorite ? <Text style={styles.badge}>즐겨찾기</Text> : null}
      </View>

      {details.length > 0 ? (
        <Text style={styles.metaText}>{details.join(' · ')}</Text>
      ) : null}

      {song.note ? (
        <Text numberOfLines={2} style={styles.noteText}>
          메모 있음 · {song.note}
        </Text>
      ) : (
        <Text style={styles.mutedMetaText}>메모 없음</Text>
      )}
    </Pressable>
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
    gap: spacing.sm,
  },
  createButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.neutral950,
    paddingHorizontal: spacing.lg,
  },
  createButtonText: { ...typography.label, color: colors.white },
  card: {
    gap: spacing.sm,
    borderRadius: 8,
    borderColor: colors.neutral300,
    borderWidth: 1,
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  cardTextBlock: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  cardTitle: {
    ...typography.label,
    color: colors.neutral950,
  },
  cardSubtitle: {
    ...typography.body,
    color: colors.neutral600,
  },
  badge: {
    ...typography.tabLabel,
    borderRadius: 8,
    backgroundColor: colors.neutral100,
    color: colors.neutral800,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  metaText: {
    ...typography.tabLabel,
    color: colors.neutral500,
  },
  mutedMetaText: {
    ...typography.tabLabel,
    color: colors.neutral500,
  },
  noteText: {
    ...typography.body,
    color: colors.neutral600,
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
})
