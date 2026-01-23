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
    type: 'Intro' | 'Verse' | 'Chorus' | 'Bridge' | 'Instrumental' | 'Tag' | 'Outro' | 'Interlude'
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