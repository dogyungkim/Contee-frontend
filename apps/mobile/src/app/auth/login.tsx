import { Redirect } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { ScreenPlaceholder } from '@/components/screen-placeholder'
import { useAuthSession } from '@/lib/auth-session'
import { getPublicEnvFlag, hasPublicEnvValue } from '@/lib/public-env'
import { colors, spacing, typography } from '@/theme'

export default function LoginScreen() {
  const { authError, bootstrap, isAuthenticated, isLoading, signInWithGoogle } =
    useAuthSession()
  const devBypassEnabled = getPublicEnvFlag('EXPO_PUBLIC_DEV_AUTH_BYPASS')
  const hasDevAccessToken = hasPublicEnvValue('EXPO_PUBLIC_DEV_ACCESS_TOKEN')
  const hasApiBaseUrl = hasPublicEnvValue('EXPO_PUBLIC_API_BASE_URL')
  const usesDevBypass = devBypassEnabled && hasDevAccessToken

  if (isAuthenticated) {
    return <Redirect href="/contis" />
  }

  const description = usesDevBypass
    ? '개발용 우회 세션이 설정되어 있습니다. 세션을 다시 확인하면 앱으로 진입합니다.'
    : 'Google 계정으로 로그인해 모바일 세션을 시작합니다.'
  const helperText = authError
    ? authError
    : usesDevBypass
      ? '개발 진입은 EXPO_PUBLIC_DEV_AUTH_BYPASS=true와 개발용 access token이 모두 있을 때만 동작합니다. 토큰 값은 화면과 로그에 표시하지 않습니다.'
      : hasApiBaseUrl
        ? '시스템 브라우저에서 인증을 완료하면 앱으로 돌아옵니다.'
        : 'EXPO_PUBLIC_API_BASE_URL 값이 필요합니다.'

  return (
    <ScreenPlaceholder
      eyebrow="Auth"
      title="로그인"
      description={description}
      action={
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            disabled={isLoading || (!usesDevBypass && !hasApiBaseUrl)}
            onPress={() =>
              void (usesDevBypass ? bootstrap() : signInWithGoogle())
            }
            style={({ pressed }) => [
              styles.primaryButton,
              pressed || isLoading ? styles.primaryButtonPressed : undefined,
              !usesDevBypass && !hasApiBaseUrl
                ? styles.primaryButtonDisabled
                : undefined,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading
                ? '확인 중...'
                : usesDevBypass
                  ? '세션 다시 확인'
                  : 'Google로 로그인'}
            </Text>
          </Pressable>
          <Text style={styles.helperText}>{helperText}</Text>
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
  primaryButtonDisabled: {
    opacity: 0.45,
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
