import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { colors, spacing, typography } from '@/theme'

interface ScreenPlaceholderProps {
  eyebrow: string
  title: string
  description: string
  action?: ReactNode
}

export function ScreenPlaceholder({
  eyebrow,
  title,
  description,
  action,
}: ScreenPlaceholderProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
        <Text style={styles.description}>{description}</Text>
        {action ? <View style={styles.action}>{action}</View> : null}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.neutral50,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.sm,
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
  action: {
    marginTop: spacing.md,
  },
})
