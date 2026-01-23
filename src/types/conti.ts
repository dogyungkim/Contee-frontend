// Conti related types

import { TeamSong } from "./song"

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
}

/**
 * ContiSong - 콘티에 포함된 곡
 */
export interface ContiSong {
    id: string
    contiId: string // Might not be in the nested list in some contexts
    teamSongId?: string // Nullable if custom song not in library? API says teamSongId is UUID.
    orderIndex: number
    note?: string // Library note? or contiNote? API response says `note`. Revisit.
    // The API response for ContiSong has "note". The request has "contiNote".
    // I will assume `note` in ContiSong refers to the note specific to this Conti connection if it's following the previous pattern, 
    // OR it might be the TeamSong's note.
    // Let's stick to the previous pattern: ContiSong has its own properties.
    // Actually, looking at the API response: "customTitle", "songTitle", "songArtist", "keyOverride", "bpmOverride", "note".
    // I will use `note` here.

    keyOverride?: string
    bpmOverride?: number

    // Additional fields from API response flattenning
    customTitle?: string
    songTitle?: string
    songArtist?: string

    createdAt: string
    updatedAt: string

    // Populated fields
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

    orderIndex: number
    keyOverride?: string
    bpmOverride?: number
    contiNote?: string
}

export type ContiSongCreateRequestItem = ContiSongCreateExisting | ContiSongCreateNew

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
    contiSongs?: ContiSongCreateRequestItem[]
}

export interface AddContiSongRequest {
    // This endpoint /api/v1/contis/{id}/songs accepts a single song addition.
    // It can be either Case 1 or Case 2 structure.
    teamSongId?: string

    customTitle?: string
    artist?: string
    customKeySignature?: string
    customBpm?: number
    youtubeUrl?: string
    sheetMusicUrl?: string
    note?: string // Library note

    keyOverride?: string
    bpmOverride?: number
    contiNote?: string

    orderIndex?: number // API doc adds this in the response example but not explicitly in request? Ah, usually appended. But doc for 'Create Conti' has orderIndex. 
    // 'Add Song to Conti' doc request body examples don't show orderIndex, but response does.
}

export interface ReorderContiSongsRequest {
    contiSongIds: string[]
}