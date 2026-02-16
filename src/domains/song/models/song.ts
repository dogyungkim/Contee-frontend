export interface Song {
  id: string;
  title: string;
  artist: string;
  keySignature?: string;
  bpm?: number;
  ccliNumber?: string;
  youtubeUrl?: string;
  sheetMusicUrl?: string;
  audioUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamSong {
  id: string;
  teamId: string;
  songId?: string;
  title: string;
  artist?: string;
  keySignature?: string;
  bpm?: number;
  ccliNumber?: string;
  youtubeUrl?: string;
  sheetMusicUrl?: string;
  note?: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SongFormPart {
  id: string;
  type:
    | 'Intro'
    | 'Verse'
    | 'Pre-chorus'
    | 'Chorus'
    | 'Bridge'
    | 'Instrumental'
    | 'Tag'
    | 'Outro'
    | 'Interlude';
  label?: string;
  bars?: number;
  abbr?: string;
}
