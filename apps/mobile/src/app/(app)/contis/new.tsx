import { getApiErrorMessage } from '@contee/api-client'
import { router } from 'expo-router'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

import { TeamFormScreen, teamFormStyles } from '@/components/team-form-screen'
import { useMobileCreateConti } from '@/lib/conti-create'
import {
  getContiMetadataInputError,
  normalizeContiMetadata,
} from '@/lib/conti-form-core'
import { useNetworkStatus } from '@/lib/query-client'
import { useTeamSelection } from '@/lib/team-selection'
import { spacing } from '@/theme'

export default function CreateContiScreen() {
  const [title, setTitle] = useState('')
  const [worshipDate, setWorshipDate] = useState('')
  const [worshipTime, setWorshipTime] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { selectedTeamId } = useTeamSelection()
  const { isNetworkAvailable } = useNetworkStatus()
  const createConti = useMobileCreateConti()

  const submit = async () => {
    const inputError = getContiMetadataInputError({
      title,
      worshipDate,
      worshipTime,
    })
    if (inputError) {
      setError(inputError)
      return
    }
    if (!selectedTeamId) {
      setError('콘티를 만들 팀을 먼저 선택해 주세요.')
      return
    }
    if (!isNetworkAvailable) {
      setError(
        '오프라인 상태에서는 콘티를 만들 수 없습니다. 연결 후 다시 시도해 주세요.'
      )
      return
    }

    setError(null)
    try {
      const conti = await createConti.mutateAsync({
        teamId: selectedTeamId,
        ...normalizeContiMetadata({ title, worshipDate, worshipTime }),
      })
      router.replace(`/contis/${conti.id}`)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    }
  }

  const isDisabled =
    !selectedTeamId || !isNetworkAvailable || createConti.isPending

  return (
    <TeamFormScreen
      description="예배 정보를 먼저 저장하고, 곡 구성은 상세 화면에서 이어서 준비합니다."
      title="새 콘티 만들기"
    >
      <View style={styles.form}>
        <View style={teamFormStyles.field}>
          <Text style={teamFormStyles.label}>콘티 제목</Text>
          <TextInput
            accessibilityLabel="콘티 제목"
            autoCapitalize="sentences"
            onChangeText={setTitle}
            placeholder="예: 주일 2부 예배"
            style={teamFormStyles.input}
            value={title}
          />
        </View>
        <View style={teamFormStyles.field}>
          <Text style={teamFormStyles.label}>예배 날짜</Text>
          <TextInput
            accessibilityLabel="예배 날짜"
            keyboardType="numbers-and-punctuation"
            maxLength={10}
            onChangeText={setWorshipDate}
            placeholder="YYYY-MM-DD"
            style={teamFormStyles.input}
            value={worshipDate}
          />
        </View>
        <View style={teamFormStyles.field}>
          <Text style={teamFormStyles.label}>예배 시간</Text>
          <TextInput
            accessibilityLabel="예배 시간"
            keyboardType="numbers-and-punctuation"
            maxLength={5}
            onChangeText={setWorshipTime}
            placeholder="HH:mm"
            style={teamFormStyles.input}
            value={worshipTime}
          />
        </View>
        {error ? (
          <Text accessibilityRole="alert" style={teamFormStyles.errorText}>
            {error}
          </Text>
        ) : null}
        {!isNetworkAvailable ? (
          <Text style={teamFormStyles.offlineText}>
            오프라인 상태에서는 콘티를 만들 수 없습니다. 연결 후 다시 시도해
            주세요.
          </Text>
        ) : null}
        <Pressable
          accessibilityLabel="콘티 만들기"
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
            {createConti.isPending ? '생성 중...' : '콘티 만들기'}
          </Text>
        </Pressable>
      </View>
    </TeamFormScreen>
  )
}

const styles = StyleSheet.create({ form: { gap: spacing.lg } })
