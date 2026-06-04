import type { Conti, ContiSong } from '../models/conti';
import type {
  ContiResponseDto,
  ContiSongResponseDto,
  ContiSongFormPartDto,
} from './conti.dto';
import { toTeamSongModel } from '@/domains/song/api/song.mapper';

const toContiSongFormPartModel = (dto: ContiSongFormPartDto) => ({
  id: dto.id,
  partOrder: dto.partOrder,
  partType: dto.partType,
  customPartName: dto.customPartName,
  repeatCount: dto.repeatCount,
  barCount: dto.barCount,
  note: dto.note,
});

export const toContiSongModel = (dto: ContiSongResponseDto): ContiSong => ({
  id: dto.id,
  contiId: dto.contiId,
  teamSongId: dto.teamSongId,
  customTitle: dto.customTitle,
  songTitle: dto.songTitle,
  songArtist: dto.songArtist,
  orderIndex: dto.orderIndex,
  keyOverride: dto.keyOverride,
  bpmOverride: dto.bpmOverride,
  note: dto.note,
  youtubeUrl: dto.youtubeUrl,
  sheetMusicUrl: dto.sheetMusicUrl,
  songForm: dto.songForm.map(toContiSongFormPartModel),
  teamSong: dto.teamSong ? toTeamSongModel(dto.teamSong) : undefined,
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt,
});

export const toContiModel = (dto: ContiResponseDto): Conti => ({
  id: dto.id,
  teamId: dto.teamId,
  createdById: dto.createdById,
  title: dto.title,
  worshipDate: dto.worshipDate,
  memo: dto.memo,
  bibleVerse: dto.bibleVerse,
  sharingInfo: dto.sharingInfo,
  status: dto.status,
  songCount: dto.songCount,
  totalDuration: dto.totalDuration,
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt,
  contiSongs: dto.contiSongs?.map(toContiSongModel),
});
