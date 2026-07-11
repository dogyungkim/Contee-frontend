'use client'

import { Loader2, Pencil } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ContiSongCard } from '@/domains/conti/components/conti-song-card'
import type { SongFormPart, TeamSong } from '@/types/song'

interface SongDetailDialogProps {
  song: TeamSong | null
  songForm: SongFormPart[]
  isSongFormLoading: boolean
  canEdit: boolean
  onClose: () => void
  onEdit: (song: TeamSong) => void
}

export function SongDetailDialog({
  song,
  songForm,
  isSongFormLoading,
  canEdit,
  onClose,
  onEdit,
}: SongDetailDialogProps) {
  return (
    <Dialog open={song !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        {song && (
          <>
            <DialogHeader>
              <DialogTitle>곡 상세</DialogTitle>
              <DialogDescription>
                팀 라이브러리에 등록된 곡 정보와 연습 자료입니다.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {isSongFormLoading ? (
                <div className="flex min-h-64 items-center justify-center gap-2 rounded-xl border bg-muted/20 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  곡 정보를 불러오는 중...
                </div>
              ) : (
                <ContiSongCard
                  index={0}
                  title={song.title}
                  artist={song.artist}
                  keySignature={song.keySignature}
                  bpm={song.bpm}
                  teamNote={song.note}
                  songForm={songForm}
                  youtubeUrl={song.youtubeUrl}
                  sheetMusicUrl={song.sheetMusicUrl}
                  badge={
                    <div className="flex flex-wrap items-center gap-2">
                      {song.isFavorite && <Badge variant="outline">즐겨찾기</Badge>}
                      {song.ccliNumber && <Badge variant="outline">CCLI {song.ccliNumber}</Badge>}
                    </div>
                  }
                  showIndex={false}
                />
              )}

              {canEdit && (
                <div className="flex justify-end border-t pt-4">
                  <Button type="button" onClick={() => onEdit(song)}>
                    <Pencil className="h-4 w-4" />
                    상세 및 송폼 수정
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
