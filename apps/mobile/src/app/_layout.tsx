import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native'

import { NetworkStatusBanner } from '@/components/network-status-banner'
import { AuthSessionProvider } from '@/lib/auth-session'
import { QueryProvider } from '@/lib/query-client'
import { TeamSelectionProvider } from '@/lib/team-selection'
import { colors, spacing, typography } from '@/theme'

export function ErrorBoundary({
  error,
  retry,
}: {
  error: Error
  retry: () => void
}) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>화면을 불러오지 못했습니다.</Text>
      <Text style={styles.errorMessage}>{error.message}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={retry}
        style={styles.retryButton}
      >
        <Text style={styles.retryButtonText}>다시 시도</Text>
      </Pressable>
    </View>
  )
}

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const backgroundColor =
    colorScheme === 'dark' ? colors.neutral950 : colors.neutral50

  return (
    <QueryProvider>
      <AuthSessionProvider>
        <TeamSelectionProvider>
          <View style={styles.root}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor },
              }}
            />
            <NetworkStatusBanner />
          </View>
        </TeamSelectionProvider>
      </AuthSessionProvider>
    </QueryProvider>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.neutral50,
  },
  errorTitle: {
    ...typography.title,
    color: colors.neutral950,
  },
  errorMessage: {
    ...typography.body,
    color: colors.neutral600,
  },
  retryButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.neutral950,
    paddingHorizontal: spacing.lg,
  },
  retryButtonText: {
    ...typography.label,
    color: colors.white,
  },
})
