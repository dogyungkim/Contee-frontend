import { getApiErrorMessage } from '@contee/api-client'
import type { TeamSong } from '@contee/domain'
import { router, useNavigation } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'

import { TeamFormScreen, teamFormStyles } from '@/components/team-form-screen'
import {
  emptySongInput,
  getSongInputError,
  toSongRequest,
  toSongUpdateRequest,
  type SongInput,
} from '@/lib/song-form-core'
import {
  useMobileCreateSong,
  useMobileSongForm,
  useMobileUpdateSong,
  useMobileUpdateSongForm,
} from '@/lib/song-mutations'
import { useNetworkStatus } from '@/lib/query-client'
import { spacing } from '@/theme'

export function SongEditorScreen({
  canEdit,
  song,
  teamId,
}: {
  canEdit: boolean
  song?: TeamSong
  teamId: string
}) {
  const initial = song
    ? {
        title: song.title,
        artist: song.artist ?? '',
        keySignature: song.keySignature ?? '',
        bpm: song.bpm?.toString() ?? '',
        note: song.note ?? '',
        form: '',
      }
    : emptySongInput
  const [input, setInput] = useState<SongInput>(initial)
  const [error, setError] = useState<string | null>(null)
  const allowRemove = useRef(false)
  const navigation = useNavigation()
  const { isNetworkAvailable } = useNetworkStatus()
  const createSong = useMobileCreateSong()
  const updateSong = useMobileUpdateSong()
  const updateSongForm = useMobileUpdateSongForm()
  const formQuery = useMobileSongForm(song ? teamId : null, song?.id ?? null)
  const formUnavailable = Boolean(
    song && (formQuery.isPending || formQuery.isError)
  )
  const initialForm =
    formQuery.data?.parts.map((part) => part.partType).join(', ') ?? ''

  useEffect(() => {
    if (song && formQuery.data) {
      setInput((current) => ({ ...current, form: initialForm }))
    }
  }, [formQuery.data, initialForm, song])

  const initialWithForm = song ? { ...initial, form: initialForm } : initial
  const isDirty = JSON.stringify(input) !== JSON.stringify(initialWithForm)
  const isSaving =
    createSong.isPending || updateSong.isPending || updateSongForm.isPending
  const disabled =
    !canEdit || !isNetworkAvailable || isSaving || formUnavailable

  useEffect(
    () =>
      navigation.addListener('beforeRemove', (event) => {
        if (!isDirty || allowRemove.current) return
        event.preventDefault()
        Alert.alert(
          '변경사항을 버릴까요?',
          '저장하지 않은 수정 내용이 있습니다.',
          [
            { text: '계속 편집', style: 'cancel' },
            {
              text: '저장하지 않고 나가기',
              style: 'destructive',
              onPress: () => {
                allowRemove.current = true
                navigation.dispatch(event.data.action)
              },
            },
          ]
        )
      }),
    [isDirty, navigation]
  )

  const updateInput = (key: keyof SongInput, value: string) =>
    setInput((current) => ({ ...current, [key]: value }))

  const submit = async () => {
    if (!canEdit) return setError('곡을 수정할 권한이 없습니다.')
    const inputError = getSongInputError(input)
    if (inputError) return setError(inputError)
    if (!isNetworkAvailable) {
      return setError(
        '오프라인 상태에서는 곡을 저장할 수 없습니다. 연결 후 다시 시도해 주세요.'
      )
    }
    setError(null)
    try {
      if (song) {
        await updateSong.mutateAsync({
          teamId,
          songId: song.id,
          request: toSongUpdateRequest(input),
        })
        await updateSongForm.mutateAsync({
          teamId,
          songId: song.id,
          request: { parts: toSongRequest(input).songForm ?? [] },
        })
      } else {
        await createSong.mutateAsync({ teamId, request: toSongRequest(input) })
      }
      allowRemove.current = true
      router.back()
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    }
  }

  return (
    <TeamFormScreen
      description="곡 정보와 예배용 곡 구성을 저장합니다. 구성은 쉼표로 구분해 입력해 주세요."
      title={song ? '곡 편집' : '새 곡 등록'}
    >
      <View style={styles.form}>
        <Field
          label="곡 제목"
          value={input.title}
          onChangeText={(value) => updateInput('title', value)}
          editable={!disabled}
        />
        <Field
          label="아티스트"
          value={input.artist}
          onChangeText={(value) => updateInput('artist', value)}
          editable={!disabled}
        />
        <View style={styles.row}>
          <View style={styles.rowField}>
            <Field
              label="키"
              value={input.keySignature}
              onChangeText={(value) => updateInput('keySignature', value)}
              editable={!disabled}
            />
          </View>
          <View style={styles.rowField}>
            <Field
              label="BPM"
              value={input.bpm}
              keyboardType="number-pad"
              onChangeText={(value) => updateInput('bpm', value)}
              editable={!disabled}
            />
          </View>
        </View>
        <View style={teamFormStyles.field}>
          <Text style={teamFormStyles.label}>곡 구성</Text>
          <TextInput
            accessibilityLabel="곡 구성"
            editable={!disabled}
            onChangeText={(value) => updateInput('form', value)}
            placeholder="VERSE, CHORUS, VERSE, CHORUS"
            style={teamFormStyles.input}
            value={input.form}
          />
          <Text style={teamFormStyles.helperText}>
            INTRO, VERSE, PRE_CHORUS, CHORUS, BRIDGE 등을 사용할 수 있습니다.
          </Text>
        </View>
        <View style={teamFormStyles.field}>
          <Text style={teamFormStyles.label}>메모</Text>
          <TextInput
            accessibilityLabel="곡 메모"
            editable={!disabled}
            multiline
            onChangeText={(value) => updateInput('note', value)}
            style={[teamFormStyles.input, teamFormStyles.multilineInput]}
            value={input.note}
          />
        </View>
        {error ? (
          <Text accessibilityRole="alert" style={teamFormStyles.errorText}>
            {error}
          </Text>
        ) : null}
        {!canEdit ? (
          <Text style={teamFormStyles.errorText}>
            곡을 수정할 권한이 없습니다.
          </Text>
        ) : null}
        {song && formQuery.isPending ? (
          <Text style={teamFormStyles.offlineText}>
            곡 구성을 불러오는 중입니다.
          </Text>
        ) : null}
        {song && formQuery.isError ? (
          <Text style={teamFormStyles.errorText}>
            {getApiErrorMessage(formQuery.error)}
          </Text>
        ) : null}
        {!isNetworkAvailable ? (
          <Text style={teamFormStyles.offlineText}>
            오프라인 상태에서는 곡을 저장할 수 없습니다.
          </Text>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={() => void submit()}
          style={[
            teamFormStyles.submitButton,
            disabled ? teamFormStyles.submitButtonDisabled : undefined,
          ]}
        >
          <Text style={teamFormStyles.submitButtonText}>
            {isSaving ? '저장 중...' : '저장'}
          </Text>
        </Pressable>
      </View>
    </TeamFormScreen>
  )
}

function Field({
  label,
  ...props
}: {
  label: string
  value: string
  editable: boolean
  keyboardType?: 'default' | 'number-pad'
  onChangeText: (value: string) => void
}) {
  return (
    <View style={teamFormStyles.field}>
      <Text style={teamFormStyles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        autoCapitalize="sentences"
        style={teamFormStyles.input}
        {...props}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg },
  row: { flexDirection: 'row', gap: spacing.md },
  rowField: { flex: 1 },
})
