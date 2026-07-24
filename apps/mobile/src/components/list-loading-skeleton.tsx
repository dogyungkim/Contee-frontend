import { StyleSheet, View } from 'react-native'

import { colors, spacing } from '@/theme'

export function ListLoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <View
      accessibilityLabel="목록을 불러오는 중"
      accessibilityRole="progressbar"
      style={styles.list}
    >
      {Array.from({ length: rows }, (_, index) => (
        <View key={index} style={styles.row}>
          <View style={styles.title} />
          <View style={styles.description} />
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  row: {
    gap: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  title: {
    width: '58%',
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.neutral300,
  },
  description: {
    width: '82%',
    height: 12,
    borderRadius: 8,
    backgroundColor: colors.neutral100,
  },
})
