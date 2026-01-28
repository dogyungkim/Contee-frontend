// Song related types

/**
 * Song (Master Song) - 전체 시스템의 마스터 곡 정보
 */
export interface Song {
    id: string
    title: string
    artist: string
    keySignature?: string
    bpm?: number
    ccliNumber?: string
    youtubeUrl?: string
    sheetMusicUrl?: string
    audioUrl?: string
    createdAt: string
    updatedAt: string
}

/**
 * TeamSong - 팀에 등록된 곡
 */
export interface TeamSong {
    id: string
    teamId: string
    songId?: string // 외부 곡 DB 참조 (nullable)
    customTitle: string
    artist?: string
    keySignature?: string
    bpm?: number
    ccliNumber?: string
    youtubeUrl?: string
    sheetMusicUrl?: string
    note?: string
    isFavorite: boolean
    createdAt: string
    updatedAt: string
}

/**
 * Custom Song Form Part Structure
 */
export interface SongFormPart {
    id: string
    type: 'Intro' | 'Verse' | 'Pre-chorus' | 'Chorus' | 'Bridge' | 'Instrumental' | 'Tag' | 'Outro' | 'Interlude'
    label?: string // e.g., "V1", "C2"
    bars?: number
    abbr?: string // Custom abbreviation for Flow summary
}

/**
 * Request DTOs
 */
export interface CreateTeamSongRequest {
    songId?: string
    customTitle: string
    artist?: string
    customKeySignature?: string
    customBpm?: number
    ccliNumber?: string
    youtubeUrl?: string
    sheetMusicUrl?: string
    note?: string
    songForm?: SongFormPartRequest[] // Added for creation with form
}

export interface UpdateTeamSongRequest {
    customTitle?: string
    artist?: string
    customKeySignature?: string
    customBpm?: number
    ccliNumber?: string
    youtubeUrl?: string
    sheetMusicUrl?: string
    note?: string
    isFavorite?: boolean
}

/**
 * Team Song Search Parameters
 */
export interface TeamSongSearchParams {
    q?: string // 제목 또는 아티스트 검색어
    key?: string // 키 (예: 'G', 'A')
    bpmMin?: number // 최소 BPM
    bpmMax?: number // 최대 BPM
    isFavorite?: boolean // 즐겨찾기 여부
}

/**
 * Song Form API Types (Backend responses)
 * Note: There's a separate UI-focused SongFormPart type above (line 43-49)
 */
export type SongPartType =
    | 'INTRO'
    | 'VERSE'
    | 'PRE_CHORUS'
    | 'CHORUS'
    | 'BRIDGE'
    | 'INTERLUDE'
    | 'OUTRO'
    | 'TAG'
    | 'INSTRUMENTAL'
    | 'ENDING'
    | 'CUSTOM'

export interface ApiSongFormPart {
    id: number
    partOrder: number
    partType: SongPartType
    customPartName?: string
    repeatCount: number
    barCount?: number
    note?: string
}

export interface SongFormResponse {
    teamSongId: string
    parts: ApiSongFormPart[]
}

export interface SongFormPartRequest {
    partType: SongPartType
    customPartName?: string
    repeatCount: number
    barCount?: number
    note?: string
}

export interface SongFormUpdateRequest {
    parts: SongFormPartRequest[]
}