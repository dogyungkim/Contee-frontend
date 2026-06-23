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
  id: number | null;
  partOrder: number | null;
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
  title?: string;
  artist?: string;
  orderIndex: number;
  key?: string;
  bpm?: number;
  note?: string;
  youtubeUrl?: string;
  sheetMusicUrl?: string;
  songForm?: ContiSongFormPartDto[];
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
  bibleVerse?: string;
  sharingInfo?: string;
  songCount?: number;
  totalDuration?: number;
  createdAt?: string;
  updatedAt?: string;
  contiSongs?: ContiSongResponseDto[];
}

export interface ContiSearchParamsDto {
  q?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
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
  title?: string;
  artist?: string;
  defaultKey?: string;
  defaultBpm?: number;
  youtubeUrl?: string;
  sheetMusicUrl?: string;
  teamNote?: string;
  orderIndex: number;
  key?: string;
  bpm?: number;
  note?: string;
  songForm?: ContiSongFormPartRequestDto[];
}

export interface CreateContiRequestDto {
  teamId: string;
  title: string;
  worshipDate: string;
  memo?: string;
  bibleVerse?: string;
  sharingInfo?: string;
  contiSongs?: ContiSongRequestItemDto[];
}

export interface UpdateContiRequestDto {
  title: string;
  worshipDate: string;
  memo?: string;
  bibleVerse?: string;
  sharingInfo?: string;
  contiSongs: ContiSongRequestItemDto[];
}
