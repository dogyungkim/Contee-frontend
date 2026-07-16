import type { TeamSong } from './model'
import type { TeamSongResponseDto } from './dto'

export function toTeamSongModel(song: TeamSongResponseDto): TeamSong {
  return song
}
