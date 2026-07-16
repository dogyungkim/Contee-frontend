import { Pressable, StyleSheet, Text } from 'react-native'

import { ScreenPlaceholder } from '@/components/screen-placeholder'
import { useAuthSession } from '@/lib/auth-session'
import { colors, spacing, typography } from '@/theme'

export default function SettingsScreen() {
  const { signOut } = useAuthSession()

  return (
    <ScreenPlaceholder
      eyebrow="Account"
      title="설정"
      description="세션 상태, 로그아웃, 법적 문서 링크를 연결할 자리입니다."
      action={
        <Pressable
          accessibilityRole="button"
          onPress={() => void signOut()}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed ? styles.logoutButtonPressed : undefined,
          ]}
        >
          <Text style={styles.logoutButtonText}>로그아웃</Text>
        </Pressable>
      }
    />
  )
}

const styles = StyleSheet.create({
  logoutButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: colors.neutral950,
    paddingHorizontal: spacing.lg,
  },
  logoutButtonPressed: {
    opacity: 0.72,
  },
  logoutButtonText: {
    ...typography.label,
    color: colors.white,
  },
})
