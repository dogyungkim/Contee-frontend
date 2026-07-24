import type {
  CreateTeamSongRequestDto,
  SongFormPartRequestDto,
  UpdateTeamSongRequestDto,
} from '@contee/domain'

export interface SongInput {
  title: string
  artist: string
  keySignature: string
  bpm: string
  note: string
  form: string
}

const formTypes = new Set([
  'INTRO',
  'VERSE',
  'PRE_CHORUS',
  'CHORUS',
  'BRIDGE',
  'INTERLUDE',
  'OUTRO',
  'TAG',
  'INSTRUMENTAL',
  'ENDING',
  'CUSTOM',
])

export const emptySongInput: SongInput = {
  title: '',
  artist: '',
  keySignature: '',
  bpm: '',
  note: '',
  form: '',
}

export function getSongInputError(input: SongInput) {
  if (!input.title.trim()) return '곡 제목을 입력해 주세요.'
  if (input.title.trim().length > 200)
    return '곡 제목은 200자 이하로 입력해 주세요.'
  if (input.bpm && (!/^\d+$/.test(input.bpm) || Number(input.bpm) <= 0)) {
    return 'BPM은 0보다 큰 정수로 입력해 주세요.'
  }
  const invalidPart = parseSongForm(input.form).find(
    (part) => !formTypes.has(part)
  )
  return invalidPart ? `알 수 없는 곡 구성입니다: ${invalidPart}` : null
}

export function parseSongForm(value: string): string[] {
  return value
    .split(',')
    .map((part) => part.trim().toUpperCase().replace(/[ -]/g, '_'))
    .filter(Boolean)
}

function toOptional(value: string) {
  return value.trim() || undefined
}

export function toSongRequest(input: SongInput): CreateTeamSongRequestDto {
  const parts = parseSongForm(input.form).map(
    (partType): SongFormPartRequestDto => ({
      partType: partType as SongFormPartRequestDto['partType'],
      repeatCount: 1,
    })
  )
  return {
    title: input.title.trim(),
    ...(toOptional(input.artist) ? { artist: toOptional(input.artist) } : {}),
    ...(toOptional(input.keySignature)
      ? { keySignature: toOptional(input.keySignature) }
      : {}),
    ...(input.bpm ? { bpm: Number(input.bpm) } : {}),
    ...(toOptional(input.note) ? { note: toOptional(input.note) } : {}),
    ...(parts.length ? { songForm: parts } : {}),
  }
}

export function toSongUpdateRequest(
  input: SongInput
): UpdateTeamSongRequestDto {
  const { songForm: _songForm, ...request } = toSongRequest(input)
  return request
}
