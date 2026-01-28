// Conti related types

import { TeamSong, ApiSongFormPart, SongFormPartRequest } from "./song"

/**
 * Conti (Continuity/Setlist) - 예배 순서지
 */
export interface Conti {
    id: string
    teamId: string
    createdById?: string
    title: string
    worshipDate: string // YYYY-MM-DD
    memo?: string
    status?: 'DRAFT' | 'CONFIRMED'

    // Aggregated fields
    songCount?: number
    totalDuration?: number

    createdAt?: string
    updatedAt?: string

    contiSongs?: ContiSong[] // Included in detail API response
}

/**
 * ContiSong - 콘티에 포함된 곡
 */
export interface ContiSong {
    id: string
    contiId?: string
    teamSongId?: string

    // Song Info (Flattened)
    customTitle?: string // 콘티에서 수정한 제목
    songTitle: string   // 원곡 제목
    songArtist: string

    orderIndex: number

    keyOverride?: string
    bpmOverride?: number
    note?: string // ContiSong note (contiNote in request, note in response per doc example? Doc says "note": "콘티용 메모")

    youtubeUrl?: string
    sheetMusicUrl?: string

    songForm: ApiSongFormPart[]

    // Optional extended fields (frontend helper)
    teamSong?: TeamSong
    createdAt?: string
    updatedAt?: string
}

/**
 * Request DTOs
 */

// Song Item for Create/Update Conti (Batch)
export interface ContiSongRequestItem {
    id?: string // For Update: Existing ContiSong ID. Null for Create.
    teamSongId?: string // Existing TeamSong ID

    // New Song creation fields (used if teamSongId is null)
    customTitle?: string
    artist?: string
    customKeySignature?: string
    customBpm?: number
    youtubeUrl?: string
    sheetMusicUrl?: string
    note?: string // TeamSong note (saved to library)

    // Conti settings
    orderIndex: number
    keyOverride?: string
    bpmOverride?: number
    contiNote?: string // "콘티용 메모" mapped to 'note' in response?
    songForm?: SongFormPartRequest[]
}

// 1. Create Conti
export interface CreateContiRequest {
    teamId: string
    title: string
    worshipDate: string // YYYY-MM-DD
    memo?: string
    contiSongs?: ContiSongRequestItem[]
}

// 3. Update Conti
export interface UpdateContiRequest {
    title?: string
    worshipDate?: string // YYYY-MM-DD
    memo?: string
    contiSongs?: ContiSongRequestItem[]
}

// 6. Add Song to Conti (Single)
export interface AddContiSongRequest {
    teamSongId?: string

    // New Song fields
    customTitle?: string
    artist?: string
    customKeySignature?: string
    customBpm?: number
    ccliNumber?: string
    youtubeUrl?: string
    sheetMusicUrl?: string
    note?: string // TeamSong note

    // Conti overrides
    keyOverride?: string
    bpmOverride?: number
    contiNote?: string
    songForm?: SongFormPartRequest[]

    // Note: orderIndex is not in the example for Single Add, 
    // backend likely appends it to the end.
}

// 7. Update Conti Song (Single)
export interface UpdateContiSongRequest {
    keyOverride?: string
    bpmOverride?: number
    contiNote?: string
    songForm?: SongFormPartRequest[]
}

// 8. Reorder Songs
export interface ReorderContiSongsRequest {
    songOrders: {
        contiSongId: string
        order: number
    }[]
}