import type { TeamSongResponseDto } from '@/domains/song/api/song.dto';

export type ContiSongPartTypeDto =
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
  | 'CUSTOM';

export interface ContiSongFormPartDto {
  id: number;
  partOrder: number;
  partType: ContiSongPartTypeDto;
  customPartName?: string;
  repeatCount: number;
  barCount?: number;
  note?: string;
}

export interface ContiSongResponseDto {
  id: string;
  contiId?: string;
  teamSongId?: string;
  customTitle?: string;
  songTitle: string;
  songArtist: string;
  orderIndex: number;
  keyOverride?: string;
  bpmOverride?: number;
  note?: string;
  youtubeUrl?: string;
  sheetMusicUrl?: string;
  songForm: ContiSongFormPartDto[];
  teamSong?: TeamSongResponseDto;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContiResponseDto {
  id: string;
  teamId: string;
  createdById?: string;
  title: string;
  worshipDate: string;
  memo?: string;
  status?: 'DRAFT' | 'CONFIRMED';
  songCount?: number;
  totalDuration?: number;
  createdAt?: string;
  updatedAt?: string;
  contiSongs?: ContiSongResponseDto[];
}

export interface ContiSongFormPartRequestDto {
  partType: ContiSongPartTypeDto;
  customPartName?: string;
  repeatCount: number;
  barCount?: number;
  note?: string;
}

export interface ContiSongRequestItemDto {
  id?: string;
  teamSongId?: string;
  customTitle?: string;
  artist?: string;
  customKeySignature?: string;
  customBpm?: number;
  youtubeUrl?: string;
  sheetMusicUrl?: string;
  note?: string;
  orderIndex: number;
  keyOverride?: string;
  bpmOverride?: number;
  contiNote?: string;
  songForm?: ContiSongFormPartRequestDto[];
}

export interface CreateContiRequestDto {
  teamId: string;
  title: string;
  worshipDate: string;
  memo?: string;
  contiSongs?: ContiSongRequestItemDto[];
}

export interface UpdateContiRequestDto {
  title?: string;
  worshipDate?: string;
  memo?: string;
  contiSongs?: ContiSongRequestItemDto[];
}

export interface AddContiSongRequestDto {
  teamSongId?: string;
  customTitle?: string;
  artist?: string;
  customKeySignature?: string;
  customBpm?: number;
  ccliNumber?: string;
  youtubeUrl?: string;
  sheetMusicUrl?: string;
  note?: string;
  keyOverride?: string;
  bpmOverride?: number;
  contiNote?: string;
  songForm?: ContiSongFormPartRequestDto[];
}

export interface UpdateContiSongRequestDto {
  keyOverride?: string;
  bpmOverride?: number;
  contiNote?: string;
  songForm?: ContiSongFormPartRequestDto[];
}

export interface ReorderContiSongsRequestDto {
  songOrders: {
    contiSongId: string;
    order: number;
  }[];
}
