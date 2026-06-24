import type { Conti, ContiSong, SharedConti } from '../models/conti';
import type {
  ContiResponseDto,
  ContiSongResponseDto,
  ContiSongFormPartDto,
  SharedContiResponseDto,
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

export const toContiSongModel = (dto: ContiSongResponseDto): ContiSong => {
  const mappedTeamSong = dto.teamSong ? toTeamSongModel(dto.teamSong) : undefined;

  return {
    id: dto.id,
    contiId: dto.contiId,
    teamSongId: dto.teamSongId,
    title: dto.title ?? mappedTeamSong?.title ?? '',
    artist: dto.artist ?? mappedTeamSong?.artist,
    orderIndex: dto.orderIndex,
    key: dto.key ?? mappedTeamSong?.keySignature,
    bpm: dto.bpm ?? mappedTeamSong?.bpm,
    note: dto.note,
    youtubeUrl: dto.youtubeUrl ?? mappedTeamSong?.youtubeUrl,
    sheetMusicUrl: dto.sheetMusicUrl ?? mappedTeamSong?.sheetMusicUrl,
    songForm: dto.songForm?.map(toContiSongFormPartModel) ?? [],
    teamSong: mappedTeamSong,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
};

export const toContiModel = (dto: ContiResponseDto): Conti => ({
  id: dto.id,
  teamId: dto.teamId ?? '',
  createdById: dto.createdById,
  createdByName: dto.createdByName,
  title: dto.title,
  worshipDate: dto.worshipDate,
  memo: dto.memo,
  bibleVerse: dto.bibleVerse,
  sharingInfo: dto.sharingInfo,
  songCount: dto.songCount,
  songPreview: dto.songPreview,
  externalShareEnabled: dto.externalShareEnabled,
  externalShare: dto.externalShare,
  totalDuration: dto.totalDuration,
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt,
  contiSongs: dto.contiSongs?.map(toContiSongModel),
});

export const toSharedContiModel = (dto: SharedContiResponseDto): SharedConti => ({
  id: dto.id,
  title: dto.title,
  worshipDate: dto.worshipDate,
  memo: dto.memo,
  bibleVerse: dto.bibleVerse,
  sharingInfo: dto.sharingInfo,
  contiSongs: dto.contiSongs?.map(toContiSongModel) ?? [],
});
