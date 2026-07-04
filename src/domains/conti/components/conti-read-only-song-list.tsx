'use client'

import type { ContiSong } from '@/types/conti'
import { mapApiSongFormToUi } from '@/domains/song/utils/song-form'
import { getContiSongDisplay } from '@/domains/conti/utils/conti-editor'
import { ContiSongCard } from './conti-song-card'

interface ContiReadOnlySongListProps {
  songs: ContiSong[]
}

export function ContiReadOnlySongList({ songs }: ContiReadOnlySongListProps) {
  if (songs.length === 0) {
    return (
      <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/5 text-center">
        <p className="text-sm font-medium italic text-muted-foreground/60">추가된 곡이 없습니다.</p>
        <p className="mt-1 text-xs text-muted-foreground/40">예배 순서에 맞춰 곡을 추가해보세요.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {songs.map((song, index) => {
        const display = getContiSongDisplay(song)

        return (
          <ContiSongCard
            key={song.id}
            index={index}
            title={display.title}
            artist={display.artist}
            keySignature={display.keySignature}
            bpm={display.bpm}
            note={display.note}
            teamNote={display.teamNote}
            songForm={mapApiSongFormToUi(display.songForm)}
            youtubeUrl={display.youtubeUrl}
            sheetMusicUrl={display.sheetMusicUrl}
            showOriginalMeta={false}
          />
        )
      })}
    </div>
  )
}
