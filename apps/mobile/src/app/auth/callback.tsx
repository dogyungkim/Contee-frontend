import { Redirect, router } from 'expo-router'
import { Pressable, StyleSheet, Text } from 'react-native'

import { ScreenPlaceholder } from '@/components/screen-placeholder'
import { useAuthSession } from '@/lib/auth-session'
import { colors, spacing, typography } from '@/theme'

export default function AuthCallbackScreen() {
  const { isAuthenticated, isLoading } = useAuthSession()

  if (isAuthenticated) {
    return <Redirect href="/contis" />
  }

  return (
    <ScreenPlaceholder
      eyebrow="Auth"
      title="인증 콜백"
      description={
        isLoading
          ? '저장된 모바일 세션을 확인하고 있습니다.'
          : '인증이 완료되지 않았습니다. 로그인 화면으로 돌아가 다시 시도해주세요.'
      }
      action={
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/auth/login')}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed ? styles.secondaryButtonPressed : undefined,
          ]}
        >
          <Text style={styles.secondaryButtonText}>
            로그인 화면으로 돌아가기
          </Text>
        </Pressable>
      }
    />
  )
}

const styles = StyleSheet.create({
  secondaryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderColor: colors.neutral300,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
  },
  secondaryButtonPressed: {
    opacity: 0.72,
  },
  secondaryButtonText: {
    ...typography.label,
    color: colors.neutral950,
  },
})
