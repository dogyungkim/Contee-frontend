import { Redirect, Stack } from 'expo-router'

import { ScreenPlaceholder } from '@/components/screen-placeholder'
import { useAuthSession } from '@/lib/auth-session'

export default function ProtectedAppLayout() {
  const { isAuthenticated, isLoading } = useAuthSession()

  if (isLoading) {
    return (
      <ScreenPlaceholder
        eyebrow="Auth"
        title="세션 확인 중"
        description="저장된 모바일 세션을 확인하고 있습니다."
      />
    )
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />
  }

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="contis/[id]" options={{ title: '콘티 상세' }} />
      <Stack.Screen
        name="share/contis/[token]"
        options={{ title: '공유 콘티' }}
      />
    </Stack>
  )
}
