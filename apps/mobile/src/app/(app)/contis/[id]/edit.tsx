import { getApiErrorMessage } from '@contee/api-client'
import type { Conti } from '@contee/domain'
import { router, useLocalSearchParams, useNavigation } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'

import { ScreenPlaceholder } from '@/components/screen-placeholder'
import { TeamFormScreen, teamFormStyles } from '@/components/team-form-screen'
import {
  getContiSongInputError,
  getContiMetadataInputError,
  hasContiChanges,
  moveContiSong,
  toContiSongInputs,
  toContiUpdateRequest,
} from '@/lib/conti-form-core'
import { useMobileUpdateConti } from '@/lib/conti-mutations'
import { getContiPermissions } from '@/lib/conti-permissions-core'
import { useMobileContiDetail } from '@/lib/conti-read'
import { useNetworkStatus } from '@/lib/query-client'
import { useMobileTeamMembers } from '@/lib/team-read'
import { useAuthSession } from '@/lib/auth-session'
import { colors, spacing, typography } from '@/theme'

export default function EditContiScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const contiId = typeof id === 'string' ? id : null
  const contiQuery = useMobileContiDetail(contiId)

  if (!contiId || contiQuery.isPending) {
    return (
      <ScreenPlaceholder
        eyebrow="Conti Edit"
        title="콘티 편집"
        description="콘티 정보를 불러오는 중입니다."
      />
    )
  }
  if (contiQuery.isError || !contiQuery.data) {
    return (
      <TeamFormScreen
        title="콘티 편집"
        description="콘티 정보를 불러오지 못했습니다."
      >
        <Text accessibilityRole="alert" style={teamFormStyles.errorText}>
          {getApiErrorMessage(contiQuery.error)}
        </Text>
      </TeamFormScreen>
    )
  }

  return <ContiEditForm conti={contiQuery.data} />
}

function ContiEditForm({ conti }: { conti: Conti }) {
  const initial = {
    title: conti.title,
    worshipDate: conti.worshipDate,
    worshipTime: conti.worshipTime,
  }
  const [title, setTitle] = useState(initial.title)
  const [worshipDate, setWorshipDate] = useState(initial.worshipDate)
  const [worshipTime, setWorshipTime] = useState(initial.worshipTime)
  const [songs, setSongs] = useState(() => toContiSongInputs(conti))
  const [error, setError] = useState<string | null>(null)
  const allowRemove = useRef(false)
  const nextDirectSongId = useRef(0)
  const navigation = useNavigation()
  const { isNetworkAvailable } = useNetworkStatus()
  const { user } = useAuthSession()
  const membersQuery = useMobileTeamMembers(conti.teamId)
  const updateConti = useMobileUpdateConti()
  const input = { title, worshipDate, worshipTime }
  const isDirty = hasContiChanges(conti, input, songs)
  const permissions = getContiPermissions({
    conti,
    currentUserId: user?.id ?? null,
    members: membersQuery.isSuccess ? membersQuery.data : undefined,
  })
  const permissionError = !permissions.isResolved
    ? membersQuery.isError
      ? '권한 정보를 확인할 수 없어 콘티 수정을 제한했습니다.'
      : '콘티 수정 권한을 확인하는 중입니다.'
    : !permissions.canEdit
      ? '이 콘티를 수정할 권한이 없습니다.'
      : null

  useEffect(() => {
    return navigation.addListener('beforeRemove', (event) => {
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
    })
  }, [isDirty, navigation])

  const submit = async () => {
    if (permissionError) {
      setError(permissionError)
      return
    }
    const inputError = getContiMetadataInputError(input)
    if (inputError) {
      setError(inputError)
      return
    }
    const songInputError = getContiSongInputError(songs)
    if (songInputError) {
      setError(songInputError)
      return
    }
    if (!isNetworkAvailable) {
      setError(
        '오프라인 상태에서는 콘티를 수정할 수 없습니다. 연결 후 다시 시도해 주세요.'
      )
      return
    }

    setError(null)
    try {
      await updateConti.mutateAsync({
        id: conti.id,
        teamId: conti.teamId,
        request: toContiUpdateRequest(conti, input, songs),
      })
      allowRemove.current = true
      router.replace(`/contis/${conti.id}`)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    }
  }

  const isDisabled =
    !isNetworkAvailable || updateConti.isPending || Boolean(permissionError)

  const addDirectSong = () => {
    nextDirectSongId.current += 1
    setSongs((current) => [
      ...current,
      {
        localId: `direct-${nextDirectSongId.current}`,
        title: '',
        songForm: [],
      },
    ])
  }

  const updateSong = (
    localId: string,
    patch: Partial<(typeof songs)[number]>
  ) => {
    setSongs((current) =>
      current.map((song) =>
        song.localId === localId ? { ...song, ...patch } : song
      )
    )
  }

  return (
    <TeamFormScreen
      description="제목과 예배 일정, 직접 입력 곡의 순서를 수정할 수 있습니다."
      title="콘티 편집"
    >
      <View style={styles.form}>
        <View style={teamFormStyles.field}>
          <Text style={teamFormStyles.label}>콘티 제목</Text>
          <TextInput
            accessibilityLabel="콘티 제목"
            autoCapitalize="sentences"
            editable={!permissionError}
            onChangeText={setTitle}
            style={teamFormStyles.input}
            value={title}
          />
        </View>
        <View style={styles.songSection}>
          <Text style={teamFormStyles.label}>곡 순서</Text>
          {songs.length ? (
            <View style={styles.songList}>
              {songs.map((song, index) => {
                const isDirectSong = !song.teamSongId
                const isSongDisabled = Boolean(permissionError)
                const songName = song.title || `곡 ${index + 1}`

                return (
                  <View key={song.localId} style={styles.songCard}>
                    <View style={styles.songHeader}>
                      <Text style={styles.songOrder}>{index + 1}</Text>
                      <Text style={styles.songType}>
                        {isDirectSong ? '직접 입력' : '보관함 곡'}
                      </Text>
                    </View>
                    {isDirectSong ? (
                      <View style={styles.songFields}>
                        <TextInput
                          accessibilityLabel={`곡 ${index + 1} 제목`}
                          editable={!isSongDisabled}
                          onChangeText={(value) =>
                            updateSong(song.localId, { title: value })
                          }
                          placeholder="곡 제목"
                          style={teamFormStyles.input}
                          value={song.title}
                        />
                        <TextInput
                          accessibilityLabel={`곡 ${index + 1} 아티스트`}
                          editable={!isSongDisabled}
                          onChangeText={(value) =>
                            updateSong(song.localId, { artist: value })
                          }
                          placeholder="아티스트 (선택)"
                          style={teamFormStyles.input}
                          value={song.artist ?? ''}
                        />
                        <View style={styles.songRow}>
                          <TextInput
                            accessibilityLabel={`곡 ${index + 1} 키`}
                            editable={!isSongDisabled}
                            onChangeText={(value) =>
                              updateSong(song.localId, { key: value })
                            }
                            placeholder="키 (선택)"
                            style={[teamFormStyles.input, styles.songRowInput]}
                            value={song.key ?? ''}
                          />
                          <TextInput
                            accessibilityLabel={`곡 ${index + 1} BPM`}
                            editable={!isSongDisabled}
                            keyboardType="decimal-pad"
                            onChangeText={(value) =>
                              updateSong(song.localId, {
                                bpm: value ? Number(value) : undefined,
                              })
                            }
                            placeholder="BPM (선택)"
                            style={[teamFormStyles.input, styles.songRowInput]}
                            value={song.bpm?.toString() ?? ''}
                          />
                        </View>
                        <TextInput
                          accessibilityLabel={`곡 ${index + 1} 메모`}
                          editable={!isSongDisabled}
                          multiline
                          onChangeText={(value) =>
                            updateSong(song.localId, { note: value })
                          }
                          placeholder="메모 (선택)"
                          style={[
                            teamFormStyles.input,
                            teamFormStyles.multilineInput,
                          ]}
                          value={song.note ?? ''}
                        />
                      </View>
                    ) : (
                      <Text style={styles.songTitle}>{song.title}</Text>
                    )}
                    <View style={styles.songActions}>
                      <Pressable
                        accessibilityLabel={`${songName} 위로 이동`}
                        accessibilityRole="button"
                        accessibilityState={{
                          disabled: isSongDisabled || index === 0,
                        }}
                        disabled={isSongDisabled || index === 0}
                        onPress={() =>
                          setSongs((current) =>
                            moveContiSong(current, index, index - 1)
                          )
                        }
                        style={styles.songActionButton}
                      >
                        <Text style={styles.songActionText}>위로</Text>
                      </Pressable>
                      <Pressable
                        accessibilityLabel={`${songName} 아래로 이동`}
                        accessibilityRole="button"
                        accessibilityState={{
                          disabled:
                            isSongDisabled || index === songs.length - 1,
                        }}
                        disabled={isSongDisabled || index === songs.length - 1}
                        onPress={() =>
                          setSongs((current) =>
                            moveContiSong(current, index, index + 1)
                          )
                        }
                        style={styles.songActionButton}
                      >
                        <Text style={styles.songActionText}>아래로</Text>
                      </Pressable>
                      {isDirectSong ? (
                        <Pressable
                          accessibilityLabel={`${songName} 삭제`}
                          accessibilityRole="button"
                          accessibilityState={{ disabled: isSongDisabled }}
                          disabled={isSongDisabled}
                          onPress={() => {
                            Alert.alert(
                              '직접 입력 곡을 삭제할까요?',
                              '저장하면 이 곡이 콘티에서 제거됩니다.',
                              [
                                { text: '취소', style: 'cancel' },
                                {
                                  text: '삭제',
                                  style: 'destructive',
                                  onPress: () =>
                                    setSongs((current) =>
                                      current.filter(
                                        (currentSong) =>
                                          currentSong.localId !== song.localId
                                      )
                                    ),
                                },
                              ]
                            )
                          }}
                          style={styles.songActionButton}
                        >
                          <Text style={styles.deleteText}>삭제</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  </View>
                )
              })}
            </View>
          ) : (
            <Text style={teamFormStyles.helperText}>등록된 곡이 없습니다.</Text>
          )}
          <Pressable
            accessibilityLabel="직접 입력 곡 추가"
            accessibilityRole="button"
            accessibilityState={{ disabled: Boolean(permissionError) }}
            disabled={Boolean(permissionError)}
            onPress={addDirectSong}
            style={styles.addSongButton}
          >
            <Text style={styles.addSongText}>직접 입력 곡 추가</Text>
          </Pressable>
        </View>
        <View style={teamFormStyles.field}>
          <Text style={teamFormStyles.label}>예배 날짜</Text>
          <TextInput
            accessibilityLabel="예배 날짜"
            editable={!permissionError}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
            onChangeText={setWorshipDate}
            style={teamFormStyles.input}
            value={worshipDate}
          />
        </View>
        <View style={teamFormStyles.field}>
          <Text style={teamFormStyles.label}>예배 시간</Text>
          <TextInput
            accessibilityLabel="예배 시간"
            editable={!permissionError}
            keyboardType="numbers-and-punctuation"
            maxLength={5}
            onChangeText={setWorshipTime}
            style={teamFormStyles.input}
            value={worshipTime}
          />
        </View>
        {error ? (
          <Text accessibilityRole="alert" style={teamFormStyles.errorText}>
            {error}
          </Text>
        ) : null}
        {permissionError ? (
          <Text accessibilityRole="alert" style={teamFormStyles.offlineText}>
            {permissionError}
          </Text>
        ) : null}
        {!isNetworkAvailable ? (
          <Text style={teamFormStyles.offlineText}>
            오프라인 상태에서는 콘티를 수정할 수 없습니다.
          </Text>
        ) : null}
        <Pressable
          accessibilityLabel="콘티 수정 저장"
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
            {updateConti.isPending ? '저장 중...' : '저장'}
          </Text>
        </Pressable>
        <Pressable
          accessibilityLabel="콘티 편집 취소"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelButtonText}>취소</Text>
        </Pressable>
      </View>
    </TeamFormScreen>
  )
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg },
  songSection: { gap: spacing.sm },
  songList: { gap: spacing.sm },
  songCard: {
    gap: spacing.sm,
    borderRadius: 8,
    borderColor: colors.neutral300,
    borderWidth: 1,
    padding: spacing.md,
  },
  songHeader: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  songOrder: { ...typography.label, color: colors.neutral950 },
  songType: { ...typography.tabLabel, color: colors.neutral500 },
  songTitle: { ...typography.body, color: colors.neutral950 },
  songFields: { gap: spacing.sm },
  songRow: { flexDirection: 'row', gap: spacing.sm },
  songRowInput: { flex: 1 },
  songActions: { flexDirection: 'row', gap: spacing.sm },
  songActionButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderColor: colors.neutral300,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
  },
  songActionText: { ...typography.tabLabel, color: colors.neutral950 },
  deleteText: { ...typography.tabLabel, color: colors.error },
  addSongButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderColor: colors.neutral300,
    borderWidth: 1,
  },
  addSongText: { ...typography.label, color: colors.neutral950 },
  cancelButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderColor: colors.neutral300,
    borderWidth: 1,
  },
  cancelButtonText: { ...typography.label, color: colors.neutral950 },
})
