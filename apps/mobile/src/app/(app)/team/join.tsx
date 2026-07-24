import { router } from 'expo-router'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

import { TeamFormScreen, teamFormStyles } from '@/components/team-form-screen'
import { useMobileTeamActions } from '@/lib/team-actions'
import {
  getInviteCodeInputError,
  normalizeInviteCode,
} from '@/lib/team-form-core'
import { spacing } from '@/theme'

export default function JoinTeamScreen() {
  const [shortCode, setShortCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { isNetworkAvailable, joinTeam } = useMobileTeamActions()

  const submit = async () => {
    const inputError = getInviteCodeInputError(shortCode)
    if (inputError) {
      setError(inputError)
      return
    }
    if (!isNetworkAvailable) {
      setError(
        '오프라인 상태에서는 팀에 참여할 수 없습니다. 연결 후 다시 시도해 주세요.'
      )
      return
    }

    setError(null)
    try {
      await joinTeam.mutateAsync(normalizeInviteCode(shortCode))
      router.replace('/contis')
    } catch {
      setError(
        '팀에 참여하지 못했습니다. 초대 코드와 연결을 확인한 뒤 다시 시도해 주세요.'
      )
    }
  }

  const isDisabled = !isNetworkAvailable || joinTeam.isPending

  return (
    <TeamFormScreen
      description="팀 관리자에게 받은 초대 코드를 입력하세요."
      title="팀에 참여하기"
    >
      <View style={styles.form}>
        <View style={teamFormStyles.field}>
          <Text style={teamFormStyles.label}>초대 코드</Text>
          <TextInput
            accessibilityLabel="초대 코드"
            autoCapitalize="characters"
            autoCorrect={false}
            onChangeText={setShortCode}
            placeholder="예: WSHIP001"
            style={teamFormStyles.input}
            value={shortCode}
          />
          <Text style={teamFormStyles.helperText}>
            공백 없이 대소문자를 구분하지 않고 입력할 수 있습니다.
          </Text>
        </View>
        {error ? (
          <Text accessibilityRole="alert" style={teamFormStyles.errorText}>
            {error}
          </Text>
        ) : null}
        {!isNetworkAvailable ? (
          <Text style={teamFormStyles.offlineText}>
            오프라인 상태에서는 팀에 참여할 수 없습니다. 연결 후 다시 시도해
            주세요.
          </Text>
        ) : null}
        <Pressable
          accessibilityLabel="팀에 참여하기"
          accessibilityRole="button"
          accessibilityState={{ disabled: isDisabled }}
          disabled={isDisabled}
          onPress={() => void submit()}
          style={[
            teamFormStyles.submitButton,
            isDisabled ? teamFormStyles.submitButtonDisabled : undefined,
          ]}
        >
          <Text style={teamFormStyles.submitButtonText}>
            {joinTeam.isPending ? '참여 중...' : '팀에 참여하기'}
          </Text>
        </Pressable>
      </View>
    </TeamFormScreen>
  )
}

const styles = StyleSheet.create({ form: { gap: spacing.lg } })
