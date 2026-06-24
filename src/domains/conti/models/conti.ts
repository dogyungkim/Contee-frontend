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
  createdByName?: string;
  title: string;
  worshipDate: string;
  memo?: string;
  bibleVerse?: string;
  sharingInfo?: string;
  songCount?: number;
  songPreview?: string[];
  externalShareEnabled?: boolean;
  externalShare?: ExternalShare;
  totalDuration?: number;
  createdAt?: string;
  updatedAt?: string;
  contiSongs?: ContiSong[];
}

export interface ExternalShare {
  enabled: boolean;
  token?: string | null;
  url?: string | null;
  createdAt?: string | null;
  createdById?: string | null;
}

export interface SharedConti {
  id: string;
  title: string;
  worshipDate: string;
  memo?: string;
  bibleVerse?: string;
  sharingInfo?: string;
  contiSongs: ContiSong[];
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
