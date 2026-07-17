import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { Conti, ContiSong, SharedConti } from '@contee/domain'

import { colors, spacing, typography } from '@/theme'

type ContiLike = Conti | SharedConti

interface ContiReadCardProps {
  conti: ContiLike
  onPress?: () => void
}

const formatWorshipDate = (date: string, time: string) =>
  [date, time].filter(Boolean).join(' ')

const getSongCount = (conti: ContiLike) =>
  'contiSongs' in conti && conti.contiSongs
    ? conti.contiSongs.length
    : 'songCount' in conti
      ? (conti.songCount ?? 0)
      : 0

export function ContiReadCard({ conti, onPress }: ContiReadCardProps) {
  const songCount = getSongCount(conti)
  const status = 'status' in conti ? conti.status : 'PUBLISHED'

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && onPress ? styles.cardPressed : undefined,
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>{conti.title}</Text>
        <Text style={styles.status}>{status}</Text>
      </View>
      <Text style={styles.meta}>
        {formatWorshipDate(conti.worshipDate, conti.worshipTime)}
      </Text>
      <Text style={styles.meta}>곡 {songCount}개</Text>
      {'songPreview' in conti && conti.songPreview?.length ? (
        <Text style={styles.preview}>{conti.songPreview.join(' · ')}</Text>
      ) : null}
      {'externalShareEnabled' in conti && conti.externalShareEnabled ? (
        <Text style={styles.shareState}>외부 공유 켜짐</Text>
      ) : null}
    </Pressable>
  )
}

export function ContiSongList({ songs }: { songs: readonly ContiSong[] }) {
  if (songs.length === 0) {
    return <Text style={styles.emptyText}>등록된 곡이 없습니다.</Text>
  }

  return (
    <View style={styles.songList}>
      {songs.map((song, index) => (
        <View key={song.id} style={styles.songItem}>
          <Text style={styles.songOrder}>{index + 1}</Text>
          <View style={styles.songText}>
            <Text style={styles.songTitle}>{song.title}</Text>
            {song.artist ? (
              <Text style={styles.songMeta}>{song.artist}</Text>
            ) : null}
            {song.key || song.bpm ? (
              <Text style={styles.songMeta}>
                {[song.key, song.bpm ? `${song.bpm} BPM` : null]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  )
}

export function ContiInfoBlock({ conti }: { conti: ContiLike }) {
  return (
    <View style={styles.infoBlock}>
      {conti.bibleVerse ? (
        <Text style={styles.infoText}>말씀: {conti.bibleVerse}</Text>
      ) : null}
      {conti.sharingInfo ? (
        <Text style={styles.infoText}>나눔: {conti.sharingInfo}</Text>
      ) : null}
      {conti.memo ? (
        <Text style={styles.infoText}>메모: {conti.memo}</Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
    borderRadius: 14,
    borderColor: colors.neutral300,
    borderWidth: 1,
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  cardPressed: {
    opacity: 0.72,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: {
    ...typography.label,
    flex: 1,
    color: colors.neutral950,
  },
  status: {
    ...typography.tabLabel,
    color: colors.neutral500,
  },
  meta: {
    ...typography.tabLabel,
    color: colors.neutral600,
  },
  preview: {
    ...typography.body,
    color: colors.neutral800,
  },
  shareState: {
    ...typography.tabLabel,
    color: colors.neutral500,
  },
  emptyText: {
    ...typography.body,
    color: colors.neutral600,
  },
  songList: {
    gap: spacing.sm,
  },
  songItem: {
    flexDirection: 'row',
    gap: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.white,
    padding: spacing.md,
  },
  songOrder: {
    ...typography.label,
    minWidth: 24,
    color: colors.neutral500,
  },
  songText: {
    flex: 1,
    gap: 2,
  },
  songTitle: {
    ...typography.label,
    color: colors.neutral950,
  },
  songMeta: {
    ...typography.tabLabel,
    color: colors.neutral600,
  },
  infoBlock: {
    gap: spacing.xs,
    borderRadius: 12,
    backgroundColor: colors.neutral100,
    padding: spacing.md,
  },
  infoText: {
    ...typography.body,
    color: colors.neutral800,
  },
})
