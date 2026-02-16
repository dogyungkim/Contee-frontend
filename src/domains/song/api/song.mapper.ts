import type { TeamSong } from '../models/song';
import type { TeamSongResponseDto } from './song.dto';

export function toTeamSongModel(song: TeamSongResponseDto): TeamSong {
  const resolvedTitle = song.title ?? song.customTitle ?? '';

  return {
    ...song,
    title: resolvedTitle,
  };
}
