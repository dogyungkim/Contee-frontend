'use client'

import { Music, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { ContiSong } from '@/types/conti'
import { ContiSongList } from './conti-song-list'

interface ContiEditSongsProps {
  songs: ContiSong[]
  onAddNewSong: () => void
  onOpenSearch: () => void
  onRemoveSong: (songId: string) => void
  onUpdateOrder: (songs: ContiSong[]) => void
  onChangeSong: (song: ContiSong) => void
  sheetMusicChanges: Record<string, { file: File | null; deleteExisting: boolean }>
  onSheetMusicChange: (songId: string, file: File | null) => void
  onSheetMusicDeleteRequest: (songId: string) => void
}

export function ContiEditSongs({
  songs,
  onAddNewSong,
  onOpenSearch,
  onRemoveSong,
  onUpdateOrder,
  onChangeSong,
  sheetMusicChanges,
  onSheetMusicChange,
  onSheetMusicDeleteRequest,
}: ContiEditSongsProps) {
  return (
    <div className="space-y-4 pb-32">
      <div className="flex items-center gap-2">
        <Music className="h-4 w-4 text-neutral-500" />
        <h3 className="font-semibold text-neutral-900">곡 목록</h3>
      </div>

      <ContiSongList
        songs={songs}
        isEditMode
        onRemove={onRemoveSong}
        onUpdateOrder={onUpdateOrder}
        onChangeSong={onChangeSong}
        sheetMusicChanges={sheetMusicChanges}
        onSheetMusicChange={onSheetMusicChange}
        onSheetMusicDeleteRequest={onSheetMusicDeleteRequest}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Button
          variant="outline"
          className="group h-32 border-dashed bg-white transition-all hover:bg-neutral-50"
          onClick={onAddNewSong}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-neutral-50 transition-transform group-hover:scale-105">
              <Plus className="h-5 w-5 text-neutral-700" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-neutral-900">새로운 찬양 등록</p>
              <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">
                라이브러리에 없는 곡 추가
              </p>
            </div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="group h-32 border-dashed bg-white transition-all hover:bg-neutral-50"
          onClick={onOpenSearch}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-neutral-50 transition-transform group-hover:scale-105">
              <Music className="h-5 w-5 text-neutral-700" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-neutral-900">기존 찬양 불러오기</p>
              <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">
                팀 라이브러리에서 선택
              </p>
            </div>
          </div>
        </Button>
      </div>
    </div>
  )
}
