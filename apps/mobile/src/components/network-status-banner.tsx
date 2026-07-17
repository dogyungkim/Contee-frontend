import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useNetworkStatus } from '@/lib/query-client'
import { colors, spacing, typography } from '@/theme'

export function NetworkStatusBanner() {
  const { isOffline } = useNetworkStatus()

  if (!isOffline) return null

  return (
    <SafeAreaView
      accessibilityRole="alert"
      edges={['top']}
      pointerEvents="none"
      style={styles.safeArea}
    >
      <View style={styles.banner}>
        <Text style={styles.text}>
          오프라인 상태입니다. 연결되면 최신 내용을 다시 불러옵니다.
        </Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 10,
  },
  banner: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.neutral950,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    shadowColor: colors.neutral950,
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 3,
  },
  text: {
    ...typography.tabLabel,
    color: colors.white,
    textAlign: 'center',
  },
})
