import { Stack } from 'expo-router'

export default function ProtectedAppLayout() {
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
