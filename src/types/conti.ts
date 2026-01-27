// Conti related types

import { TeamSong, ApiSongFormPart, SongFormPartRequest } from "./song"

/**
 * Conti (Continuity/Setlist) - 예배 순서지
 */
export interface Conti {
    id: string
    teamId: string
    title: string
    worshipDate: string // YYYY-MM-DDT... or just Date string depending on backend. API docs says YYYY-MM-DD but new/page.tsx constructs ISO string.
    memo?: string
    status?: 'DRAFT' | 'CONFIRMED' // Added status from API doc
    createdAt: string
    updatedAt: string
    contiSongs?: ContiSong[] // Included in detail API response
}

/**
 * ContiSong - 콘티에 포함된 곡
 */
export interface ContiSong {
    id: string
    contiId: string
    teamSongId: string
    orderIndex: number
    note?: string // Conti-specific note (response field)

    keyOverride?: string
    bpmOverride?: number

    // Flattened fields from API response
    customTitle?: string // Team's custom title
    songTitle: string // Original song title
    songArtist?: string
    youtubeUrl?: string
    sheetMusicUrl?: string
    songForm: ApiSongFormPart[] // Song structure (Intro, Verse, Chorus, etc.)

    createdAt: string
    updatedAt: string

    // Populated fields (optional)
    teamSong?: TeamSong
}

/**
 * Request DTOs
 */

// Case 1: Existing Library Song
export interface ContiSongCreateExisting {
    teamSongId: string
    orderIndex: number
    keyOverride?: string
    bpmOverride?: number
    contiNote?: string
}

// Case 2: New Song
export interface ContiSongCreateNew {
    customTitle: string
    artist?: string
    customKeySignature?: string
    customBpm?: number
    youtubeUrl?: string
    sheetMusicUrl?: string
    note?: string // Library note
    songForm?: SongFormPartRequest[] // Song structure for new song (Added)

    orderIndex: number
    keyOverride?: string
    bpmOverride?: number
    contiNote?: string
}

export type ContiSongCreateRequestItem = ContiSongCreateExisting | ContiSongCreateNew

// Update Request Item (can include id for existing items)
export interface ContiSongUpdateExisting {
    id?: string // If present, updates existing ContiSong. If null/undefined, creates new.
    teamSongId: string
    orderIndex: number
    keyOverride?: string
    bpmOverride?: number
    contiNote?: string
}

export interface ContiSongUpdateNew {
    id?: string // Should be null/undefined for new songs usually, but kept for consistency
    customTitle: string
    artist?: string
    customKeySignature?: string
    customBpm?: number
    youtubeUrl?: string
    sheetMusicUrl?: string
    note?: string
    songForm?: SongFormPartRequest[]

    orderIndex: number
    keyOverride?: string
    bpmOverride?: number
    contiNote?: string
}

export type ContiSongUpdateRequestItem = ContiSongUpdateExisting | ContiSongUpdateNew

export interface CreateContiRequest {
    teamId: string
    title: string
    worshipDate: string
    memo?: string
    contiSongs?: ContiSongCreateRequestItem[]
}

export interface UpdateContiRequest {
    title?: string
    worshipDate?: string
    memo?: string
    contiSongs?: ContiSongUpdateRequestItem[]
}

export interface AddContiSongRequest {
    // Case 1: Adding existing library song
    teamSongId?: string

    // Case 2: Creating new song
    customTitle?: string
    artist?: string
    customKeySignature?: string
    customBpm?: number
    youtubeUrl?: string
    sheetMusicUrl?: string
    note?: string // Library note for new song
    songForm?: SongFormPartRequest[] // Song structure for new song

    // Conti-specific overrides
    keyOverride?: string
    bpmOverride?: number
    contiNote?: string

    orderIndex?: number
}

export interface UpdateContiSongRequest {
    keyOverride?: string
    bpmOverride?: number
    contiNote?: string
    songForm?: SongFormPartRequest[]
}

export interface ReorderContiSongsRequest {
    contiSongIds: string[]
}