import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import {
  clearApiUnavailable,
  useApiAvailability,
} from '@/lib/api-availability'
import { useNetworkStatus } from '@/lib/query-client'
import { colors, spacing, typography } from '@/theme'

export function NetworkStatusBanner() {
  const { isOffline } = useNetworkStatus()
  const { isUnavailable } = useApiAvailability()
  const showServiceUnavailable = !isOffline && isUnavailable

  if (!isOffline && !showServiceUnavailable) return null

  return (
    <SafeAreaView
      accessibilityRole="alert"
      edges={['top']}
      pointerEvents={showServiceUnavailable ? 'box-none' : 'none'}
      style={styles.safeArea}
    >
      <View style={styles.banner}>
        {showServiceUnavailable ? (
          <View style={styles.serviceContent}>
            <Text style={[styles.text, styles.serviceText]}>
              서버에 일시적으로 연결할 수 없습니다. 잠시 후 다시 시도해
              주세요.
            </Text>
            <Pressable
              accessibilityLabel="서비스 연결 오류 배너 닫기"
              accessibilityRole="button"
              hitSlop={spacing.sm}
              onPress={clearApiUnavailable}
              style={styles.dismissButton}
            >
              <Text style={styles.dismissButtonText}>닫기</Text>
            </Pressable>
          </View>
        ) : (
          <Text style={styles.text}>
            오프라인 상태입니다. 연결되면 최신 내용을 다시 불러옵니다.
          </Text>
        )}
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
  serviceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  text: {
    ...typography.tabLabel,
    flex: 1,
    color: colors.white,
    textAlign: 'center',
  },
  serviceText: {
    textAlign: 'left',
  },
  dismissButton: {
    minHeight: 28,
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.neutral300,
    paddingHorizontal: spacing.md,
  },
  dismissButtonText: {
    ...typography.tabLabel,
    color: colors.white,
  },
})
