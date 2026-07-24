import { Redirect, Stack } from 'expo-router'
import { Pressable, StyleSheet, Text } from 'react-native'

import { ScreenPlaceholder } from '@/components/screen-placeholder'
import {
  TeamSelectionOverlayHost,
  TeamSelectionOverlayProvider,
} from '@/components/team-selection-modal'
import { useAuthSession } from '@/lib/auth-session'
import { colors, spacing, typography } from '@/theme'

export default function ProtectedAppLayout() {
  const { bootstrap, isAuthenticated, isLoading, status } = useAuthSession()

  if (isLoading) {
    return (
      <ScreenPlaceholder
        eyebrow="Auth"
        title="세션 확인 중"
        description="저장된 모바일 세션을 확인하고 있습니다."
      />
    )
  }

  if (status === 'unavailable') {
    return (
      <ScreenPlaceholder
        eyebrow="Auth"
        title="인증 서버 연결 불가"
        description="저장된 세션은 유지했습니다. 네트워크 또는 서버 상태를 확인한 뒤 다시 시도해 주세요."
        action={
          <Pressable
            accessibilityRole="button"
            onPress={() => void bootstrap()}
            style={({ pressed }) => [
              styles.retryButton,
              pressed ? styles.retryButtonPressed : undefined,
            ]}
          >
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </Pressable>
        }
      />
    )
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />
  }

  return (
    <TeamSelectionOverlayProvider>
      <Stack
        screenOptions={{
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="contis/new" options={{ title: '새 콘티 만들기' }} />
        <Stack.Screen name="contis/[id]" options={{ title: '콘티 상세' }} />
        <Stack.Screen name="team/create" options={{ title: '새 팀 만들기' }} />
        <Stack.Screen name="team/join" options={{ title: '팀에 참여하기' }} />
        <Stack.Screen
          name="share/contis/[token]"
          options={{ title: '공유 콘티' }}
        />
      </Stack>
      <TeamSelectionOverlayHost />
    </TeamSelectionOverlayProvider>
  )
}

const styles = StyleSheet.create({
  retryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.neutral950,
    paddingHorizontal: spacing.lg,
  },
  retryButtonPressed: {
    opacity: 0.72,
  },
  retryButtonText: {
    ...typography.label,
    color: colors.white,
  },
})
