import type { TeamSong } from '../models/song';
import type { TeamSongResponseDto } from './song.dto';

export function toTeamSongModel(song: TeamSongResponseDto): TeamSong {
  return song;
}
