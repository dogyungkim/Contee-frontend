import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useAuthSession } from '@/lib/auth-session'
import {
  getDevelopmentAuthBypassEnabled,
  hasPublicEnvValue,
} from '@/lib/public-env'
import { colors, spacing, typography } from '@/theme'

const getSessionStatusLabel = (
  status: ReturnType<typeof useAuthSession>['status']
) => {
  if (status === 'authenticated') {
    return '인증됨'
  }

  if (status === 'bootstrapping') {
    return '확인 중'
  }

  if (status === 'unavailable') {
    return '연결 불가'
  }

  return '인증되지 않음'
}

export default function SettingsScreen() {
  const { authError, isAuthenticated, isLoading, signOut, status } =
    useAuthSession()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const devBypassEnabled = getDevelopmentAuthBypassEnabled()
  const hasDevAccessToken = hasPublicEnvValue('EXPO_PUBLIC_DEV_ACCESS_TOKEN')
  const hasApiBaseUrl = hasPublicEnvValue('EXPO_PUBLIC_API_BASE_URL')
  const isLogoutDisabled = isLoading || isSigningOut || !isAuthenticated
  const authMode =
    devBypassEnabled && hasDevAccessToken
      ? '개발용 우회 활성'
      : 'Production OAuth 차단됨'

  const handleSignOut = async () => {
    if (isLogoutDisabled) {
      return
    }

    setIsSigningOut(true)

    try {
      await signOut()
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Account</Text>
          <Text accessibilityRole="header" style={styles.title}>
            설정
          </Text>
          <Text style={styles.description}>
            현재 모바일 세션과 연결 설정을 확인하고, 이 기기의 세션을
            종료합니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>계정 및 세션</Text>
          <View style={styles.card}>
            <StatusRow
              label="세션 상태"
              value={getSessionStatusLabel(status)}
              tone={isAuthenticated ? 'ready' : 'neutral'}
            />
            <StatusRow
              label="인증 모드"
              value={authMode}
              description={
                devBypassEnabled && hasDevAccessToken
                  ? '개발용 access token이 설정되어 앱 진입에 사용할 수 있습니다.'
                  : '모바일 OAuth 토큰 교환 endpoint가 준비될 때까지 실제 로그인은 비활성화됩니다.'
              }
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>연결 설정</Text>
          <View style={styles.card}>
            <StatusRow
              label="API base URL"
              value={hasApiBaseUrl ? '설정됨' : '미설정'}
              tone={hasApiBaseUrl ? 'ready' : 'warning'}
              description={
                hasApiBaseUrl
                  ? '공개 환경 변수에 API endpoint가 연결되어 있습니다.'
                  : 'EXPO_PUBLIC_API_BASE_URL 값이 필요합니다.'
              }
            />
            <StatusRow
              label="법적 문서 링크"
              value="아직 연결되지 않음"
              description="외부 링크 열기는 다음 단계에서 연결합니다."
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>세션 작업</Text>
          <View style={styles.card}>
            <Text style={styles.actionDescription}>
              로그아웃하면 저장된 모바일 세션과 캐시된 앱 데이터를 이 기기에서
              정리합니다. 토큰 값은 화면에 표시하지 않습니다.
            </Text>
            <Pressable
              accessibilityRole="button"
              disabled={isLogoutDisabled}
              onPress={() => void handleSignOut()}
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && !isLogoutDisabled
                  ? styles.logoutButtonPressed
                  : undefined,
                isLogoutDisabled ? styles.logoutButtonDisabled : undefined,
              ]}
            >
              <Text
                style={[
                  styles.logoutButtonText,
                  isLogoutDisabled
                    ? styles.logoutButtonTextDisabled
                    : undefined,
                ]}
              >
                {isSigningOut ? '로그아웃 중...' : '로그아웃'}
              </Text>
            </Pressable>
            {authError ? (
              <Text style={styles.authError}>{authError}</Text>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

interface StatusRowProps {
  label: string
  value: string
  description?: string
  tone?: 'neutral' | 'ready' | 'warning'
}

function StatusRow({
  label,
  value,
  description,
  tone = 'neutral',
}: StatusRowProps) {
  return (
    <View style={styles.statusRow}>
      <View style={styles.statusHeader}>
        <Text style={styles.statusLabel}>{label}</Text>
        <Text style={[styles.statusValue, styles[tone]]}>{value}</Text>
      </View>
      {description ? (
        <Text style={styles.statusDescription}>{description}</Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.neutral50,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    gap: spacing.sm,
  },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.neutral500,
  },
  title: {
    ...typography.title,
    color: colors.neutral950,
  },
  description: {
    ...typography.body,
    color: colors.neutral600,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.neutral800,
  },
  card: {
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral300,
    borderRadius: 16,
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  statusRow: {
    gap: spacing.xs,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  statusLabel: {
    ...typography.tabLabel,
    color: colors.neutral500,
  },
  statusValue: {
    ...typography.label,
    flexShrink: 1,
    textAlign: 'right',
  },
  statusDescription: {
    ...typography.tabLabel,
    color: colors.neutral500,
  },
  neutral: {
    color: colors.neutral800,
  },
  ready: {
    color: colors.neutral950,
  },
  warning: {
    color: colors.neutral600,
  },
  actionDescription: {
    ...typography.body,
    color: colors.neutral600,
  },
  authError: {
    ...typography.tabLabel,
    color: colors.error,
  },
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
  logoutButtonDisabled: {
    backgroundColor: colors.neutral300,
  },
  logoutButtonText: {
    ...typography.label,
    color: colors.white,
  },
  logoutButtonTextDisabled: {
    color: colors.neutral600,
  },
})
