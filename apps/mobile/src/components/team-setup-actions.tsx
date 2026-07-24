import { router } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { colors, spacing, typography } from '@/theme'

export function TeamSetupActions({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = (href: '/team/create' | '/team/join') => {
    onNavigate?.()
    router.push(href)
  }

  return (
    <View style={styles.actions}>
      <Pressable
        accessibilityLabel="팀 만들기"
        accessibilityRole="button"
        onPress={() => navigate('/team/create')}
        style={styles.primaryButton}
      >
        <Text style={styles.primaryButtonText}>팀 만들기</Text>
      </Pressable>
      <Pressable
        accessibilityLabel="초대 코드로 참여"
        accessibilityRole="button"
        onPress={() => navigate('/team/join')}
        style={styles.secondaryButton}
      >
        <Text style={styles.secondaryButtonText}>초대 코드로 참여</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  actions: { gap: spacing.sm },
  primaryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.neutral950,
    paddingHorizontal: spacing.lg,
  },
  primaryButtonText: { ...typography.label, color: colors.white },
  secondaryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderColor: colors.neutral300,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
  },
  secondaryButtonText: { ...typography.label, color: colors.neutral950 },
})
