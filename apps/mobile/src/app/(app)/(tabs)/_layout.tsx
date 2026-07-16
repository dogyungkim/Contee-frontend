import { Tabs } from 'expo-router'
import { ListMusic, Music2, Settings, Users } from 'lucide-react-native'

import { colors, spacing, typography } from '@/theme'

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: false,
        tabBarActiveTintColor: colors.neutral950,
        tabBarInactiveTintColor: colors.neutral500,
        tabBarLabelStyle: typography.tabLabel,
        tabBarStyle: {
          minHeight: 64,
          paddingBottom: spacing.sm,
          paddingTop: spacing.xs,
        },
      }}
    >
      <Tabs.Screen
        name="contis/index"
        options={{
          title: '콘티',
          tabBarIcon: ({ color, size }) => (
            <ListMusic color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="songs/index"
        options={{
          title: '곡',
          tabBarIcon: ({ color, size }) => <Music2 color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="team/index"
        options={{
          title: '팀',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          title: '설정',
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  )
}
