import { Redirect } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { ScreenPlaceholder } from '@/components/screen-placeholder'
import { useAuthSession } from '@/lib/auth-session'
import { getPublicEnvFlag, hasPublicEnvValue } from '@/lib/public-env'
import { colors, spacing, typography } from '@/theme'

export default function LoginScreen() {
  const { bootstrap, isAuthenticated, isLoading } = useAuthSession()
  const devBypassEnabled = getPublicEnvFlag('EXPO_PUBLIC_DEV_AUTH_BYPASS')
  const hasDevAccessToken = hasPublicEnvValue('EXPO_PUBLIC_DEV_ACCESS_TOKEN')

  if (isAuthenticated) {
    return <Redirect href="/contis" />
  }

  const description =
    devBypassEnabled && hasDevAccessToken
      ? '개발용 우회 세션이 설정되어 있습니다. 세션을 다시 확인하면 앱으로 진입합니다.'
      : '모바일 OAuth 토큰 교환 endpoint가 준비되기 전까지 production 로그인은 차단됩니다.'

  return (
    <ScreenPlaceholder
      eyebrow="Auth"
      title="로그인"
      description={description}
      action={
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            disabled={isLoading}
            onPress={() => void bootstrap()}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed || isLoading ? styles.primaryButtonPressed : undefined,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? '확인 중...' : '세션 다시 확인'}
            </Text>
          </Pressable>
          <Text style={styles.helperText}>
            개발 진입은 EXPO_PUBLIC_DEV_AUTH_BYPASS=true와 개발용 access token이
            모두 있을 때만 동작합니다. 토큰 값은 화면과 로그에 표시하지
            않습니다.
          </Text>
        </View>
      }
    />
  )
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.md,
  },
  primaryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: colors.neutral950,
    paddingHorizontal: spacing.lg,
  },
  primaryButtonPressed: {
    opacity: 0.72,
  },
  primaryButtonText: {
    ...typography.label,
    color: colors.white,
  },
  helperText: {
    ...typography.tabLabel,
    color: colors.neutral500,
  },
})
