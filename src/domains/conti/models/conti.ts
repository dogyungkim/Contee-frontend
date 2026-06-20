import type { TeamSong } from '@/domains/song/models/song';

export type ContiSongPartType =
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

export interface ContiSongFormPart {
  id: number | null;
  partOrder: number | null;
  partType: ContiSongPartType;
  customPartName?: string;
  repeatCount: number;
  barCount?: number;
  note?: string;
}

export interface Conti {
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
  contiSongs?: ContiSong[];
}

export interface ContiSong {
  id: string;
  contiId?: string;
  teamSongId?: string;
  title: string;
  artist?: string;
  orderIndex: number;
  key?: string;
  bpm?: number;
  note?: string;
  youtubeUrl?: string;
  sheetMusicUrl?: string;
  songForm: ContiSongFormPart[];
  teamSong?: TeamSong;
  createdAt?: string;
  updatedAt?: string;
}
