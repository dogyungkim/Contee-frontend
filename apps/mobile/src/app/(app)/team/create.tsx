import { router } from 'expo-router'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

import { TeamFormScreen, teamFormStyles } from '@/components/team-form-screen'
import { useMobileTeamActions } from '@/lib/team-actions'
import {
  getCreateTeamInputError,
  normalizeTeamDescription,
  normalizeTeamName,
} from '@/lib/team-form-core'
import { spacing } from '@/theme'

export default function CreateTeamScreen() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { createTeam, isNetworkAvailable } = useMobileTeamActions()

  const submit = async () => {
    const inputError = getCreateTeamInputError({ name, description })
    if (inputError) {
      setError(inputError)
      return
    }
    if (!isNetworkAvailable) {
      setError(
        '오프라인 상태에서는 팀을 만들 수 없습니다. 연결 후 다시 시도해 주세요.'
      )
      return
    }

    setError(null)
    try {
      await createTeam.mutateAsync({
        name: normalizeTeamName(name),
        description: normalizeTeamDescription(description),
      })
      router.replace('/contis')
    } catch {
      setError('팀을 만들지 못했습니다. 연결을 확인한 뒤 다시 시도해 주세요.')
    }
  }

  const isDisabled = !isNetworkAvailable || createTeam.isPending

  return (
    <TeamFormScreen
      description="함께 찬양을 준비할 새 팀을 만드세요."
      title="새 팀 만들기"
    >
      <View style={styles.form}>
        <View style={teamFormStyles.field}>
          <Text style={teamFormStyles.label}>팀 이름</Text>
          <TextInput
            accessibilityLabel="팀 이름"
            autoCapitalize="words"
            maxLength={100}
            onChangeText={setName}
            placeholder="예: 여의도 청년부 찬양팀"
            style={teamFormStyles.input}
            value={name}
          />
        </View>
        <View style={teamFormStyles.field}>
          <Text style={teamFormStyles.label}>설명 (선택)</Text>
          <TextInput
            accessibilityLabel="팀 설명"
            maxLength={2000}
            multiline
            onChangeText={setDescription}
            placeholder="팀에 대한 간단한 설명을 적어 주세요."
            style={[teamFormStyles.input, teamFormStyles.multilineInput]}
            value={description}
          />
        </View>
        {error ? (
          <Text accessibilityRole="alert" style={teamFormStyles.errorText}>
            {error}
          </Text>
        ) : null}
        {!isNetworkAvailable ? (
          <Text style={teamFormStyles.offlineText}>
            오프라인 상태에서는 팀을 만들 수 없습니다. 연결 후 다시 시도해
            주세요.
          </Text>
        ) : null}
        <Pressable
          accessibilityLabel="팀 생성하기"
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
            {createTeam.isPending ? '생성 중...' : '팀 생성하기'}
          </Text>
        </Pressable>
      </View>
    </TeamFormScreen>
  )
}

const styles = StyleSheet.create({ form: { gap: spacing.lg } })
