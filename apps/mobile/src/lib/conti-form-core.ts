import type {
  Conti,
  ContiSong,
  ContiSongFormPart,
  UpdateContiRequestDto,
} from '@contee/domain'

export interface ContiMetadataInput {
  title: string
  worshipDate: string
  worshipTime: string
}

export interface ContiSongInput {
  localId: string
  id?: string
  teamSongId?: string
  title: string
  artist?: string
  key?: string
  bpm?: number
  note?: string
  youtubeUrl?: string
  sheetMusicUrl?: string
  songForm: ContiSongFormPart[]
}

function toContiSongInput(song: ContiSong): ContiSongInput {
  return {
    localId: song.id,
    id: song.id,
    teamSongId: song.teamSongId,
    title: song.title,
    artist: song.artist,
    key: song.key,
    bpm: song.bpm,
    note: song.note,
    youtubeUrl: song.youtubeUrl,
    sheetMusicUrl: song.sheetMusicUrl,
    songForm: song.songForm,
  }
}

export function toContiSongInputs(conti: Conti) {
  return [...(conti.contiSongs ?? [])]
    .sort((left, right) => left.orderIndex - right.orderIndex)
    .map(toContiSongInput)
}

export function moveContiSong(
  songs: readonly ContiSongInput[],
  fromIndex: number,
  toIndex: number
) {
  if (
    fromIndex < 0 ||
    fromIndex >= songs.length ||
    toIndex < 0 ||
    toIndex >= songs.length ||
    fromIndex === toIndex
  ) {
    return [...songs]
  }

  const next = [...songs]
  const [song] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, song)
  return next
}

export function normalizeContiMetadata(input: {
  title: string
  worshipDate: string
  worshipTime: string
}) {
  return {
    title: input.title.trim(),
    worshipDate: input.worshipDate.trim(),
    worshipTime: input.worshipTime.trim(),
  }
}

export function hasContiMetadataChanges(
  initial: ContiMetadataInput,
  current: ContiMetadataInput
) {
  const normalized = normalizeContiMetadata(current)
  return (
    initial.title !== normalized.title ||
    initial.worshipDate !== normalized.worshipDate ||
    initial.worshipTime !== normalized.worshipTime
  )
}

export function toContiUpdateRequest(
  conti: Conti,
  input: ContiMetadataInput,
  songs: readonly ContiSongInput[] = toContiSongInputs(conti)
): UpdateContiRequestDto {
  return {
    ...normalizeContiMetadata(input),
    memo: conti.memo,
    bibleVerse: conti.bibleVerse,
    sharingInfo: conti.sharingInfo,
    contiSongs: songs.map((song, orderIndex) => ({
      id: song.id,
      teamSongId: song.teamSongId,
      title: song.title.trim() || undefined,
      artist: song.artist?.trim() || undefined,
      orderIndex,
      key: song.key?.trim() || undefined,
      bpm: song.bpm,
      note: song.note?.trim() || undefined,
      youtubeUrl: song.youtubeUrl,
      sheetMusicUrl: song.sheetMusicUrl,
      songForm: song.songForm.map(
        ({ partType, customPartName, repeatCount, barCount, note }) => ({
          partType,
          customPartName,
          repeatCount,
          barCount,
          note,
        })
      ),
    })),
  }
}

export function getContiSongInputError(songs: readonly ContiSongInput[]) {
  if (songs.some((song) => !song.teamSongId && !song.title.trim())) {
    return '직접 입력한 곡의 제목을 입력해 주세요.'
  }
  if (
    songs.some((song) => song.bpm !== undefined && !Number.isFinite(song.bpm))
  ) {
    return 'BPM은 숫자로 입력해 주세요.'
  }

  return null
}

export function hasContiChanges(
  conti: Conti,
  input: ContiMetadataInput,
  songs: readonly ContiSongInput[]
) {
  if (
    hasContiMetadataChanges(
      {
        title: conti.title,
        worshipDate: conti.worshipDate,
        worshipTime: conti.worshipTime,
      },
      input
    )
  ) {
    return true
  }

  const initialSongs = toContiUpdateRequest(
    conti,
    {
      title: conti.title,
      worshipDate: conti.worshipDate,
      worshipTime: conti.worshipTime,
    },
    toContiSongInputs(conti)
  ).contiSongs
  const currentSongs = toContiUpdateRequest(conti, input, songs).contiSongs
  return JSON.stringify(initialSongs) !== JSON.stringify(currentSongs)
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return (
    !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
  )
}

export function getContiMetadataInputError(input: {
  title: string
  worshipDate: string
  worshipTime: string
}) {
  const metadata = normalizeContiMetadata(input)

  if (!metadata.title) return '콘티 제목을 입력해 주세요.'
  if (!isValidDate(metadata.worshipDate)) {
    return '예배 날짜를 YYYY-MM-DD 형식으로 입력해 주세요.'
  }
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(metadata.worshipTime)) {
    return '예배 시간을 HH:mm 형식으로 입력해 주세요.'
  }

  return null
}
