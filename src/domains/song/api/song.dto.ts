import type { Song, TeamSong } from '../models/song';

export type SongResponseDto = Song;

export type TeamSongResponseDto = TeamSong;

export interface CreateTeamSongRequestDto {
  songId?: string;
  title: string;
  artist?: string;
  keySignature?: string;
  bpm?: number;
  ccliNumber?: string;
  youtubeUrl?: string;
  sheetMusicUrl?: string;
  note?: string;
  songForm?: SongFormPartRequestDto[];
}

export interface UpdateTeamSongRequestDto {
  title?: string;
  artist?: string;
  keySignature?: string;
  bpm?: number;
  ccliNumber?: string;
  youtubeUrl?: string;
  sheetMusicUrl?: string;
  note?: string;
  isFavorite?: boolean;
}

export interface TeamSongSearchParamsDto {
  q?: string;
  key?: string;
  bpmMin?: number;
  bpmMax?: number;
  isFavorite?: boolean;
  page?: number;
  size?: number;
}

export type SongPartTypeDto =
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

export interface ApiSongFormPartDto {
  id: number | null;
  partOrder: number | null;
  partType: SongPartTypeDto;
  customPartName?: string;
  repeatCount: number;
  barCount?: number;
  note?: string;
}

export interface SongFormResponseDto {
  teamSongId: string;
  parts: ApiSongFormPartDto[];
}

export interface SongFormPartRequestDto {
  partType: SongPartTypeDto;
  customPartName?: string;
  repeatCount: number;
  barCount?: number;
  note?: string;
}

export interface SongFormUpdateRequestDto {
  parts: SongFormPartRequestDto[];
}
