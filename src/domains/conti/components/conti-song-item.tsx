'use client'

import {
  X,
  GripVertical,
  Star,
} from 'lucide-react'
import { useMemo } from 'react'
import { ContiSong, ContiSongFormPart } from '@/types/conti'
import { Button } from '@/components/ui/button'
import { Toggle } from '@/components/ui/toggle'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import { useUpdateTeamSong } from '@/domains/song/hooks/use-songs'
import { mapApiSongFormToUi } from '@/domains/song/utils/song-form'
import { getContiSongDisplay } from '@/domains/conti/utils/conti-editor'
import { ContiSongCard } from './conti-song-card'
import { SongDirectEditCard } from './song-direct-edit-card'
import type { SongFormPartRequest } from '@/types/song'

const mapRequestSongFormToConti = (parts: SongFormPartRequest[] = []): ContiSongFormPart[] =>
  parts.map((part, index) => ({
    id: null,
    partOrder: index,
    partType: part.partType,
    customPartName: part.customPartName,
    repeatCount: part.repeatCount,
    barCount: part.barCount,
    note: part.note,
  }))

interface ContiSongItemProps {
  id: string
  contiSong: ContiSong
  index: number
  isEditMode: boolean
  onRemove: (id: string) => void
  onChange: (song: ContiSong) => void
}

export function ContiSongItem({ id, contiSong, index, isEditMode, onRemove, onChange }: ContiSongItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const { mutate: updateTeamSong } = useUpdateTeamSong()
  const teamSong = contiSong.teamSong
  const display = getContiSongDisplay(contiSong)
  const form = {
    title: display.title || '',
    artist: display.artist || '',
    keySignature: display.keySignature || '',
    bpm: display.bpm || 0,
    youtubeUrl: display.youtubeUrl || '',
    sheetMusicUrl: display.sheetMusicUrl || '',
    note: display.note || '',
  }
  const songFormParts = useMemo(() => mapApiSongFormToUi(contiSong.songForm), [contiSong.songForm])
  const isKeyOverridden = !!form.keySignature && form.keySignature !== teamSong?.keySignature
  const isBpmOverridden = !!form.bpm && form.bpm !== teamSong?.bpm
  const handleToggleFavorite = () => {
    if (!teamSong) return
    updateTeamSong({
      teamId: teamSong.teamId,
      songId: teamSong.id,
      request: { isFavorite: !teamSong.isFavorite },
    })
  }
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 1,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <ContiSongCard
        index={index}
        title={display.title}
        artist={display.artist}
        keySignature={form.keySignature}
        bpm={form.bpm}
        originalKey={teamSong?.keySignature}
        originalBpm={teamSong?.bpm}
        note={form.note}
        teamNote={teamSong?.note}
        songForm={songFormParts}
        youtubeUrl={display.youtubeUrl}
        sheetMusicUrl={display.sheetMusicUrl}
        isDragging={isDragging}
        highlightKey={isKeyOverridden}
        highlightBpm={isBpmOverridden}
        showOriginalMeta={false}
        showBodyMeta
        dragHandle={
          isEditMode ? (
            <button
              type="button"
              {...attributes}
              {...listeners}
              className="cursor-grab rounded p-1.5 text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-600 active:cursor-grabbing"
              aria-label={`${index + 1}번째 곡 ${contiSong.title} 순서 변경`}
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-4 w-4" />
            </button>
          ) : null
        }
        headerAction={
          <div className="flex items-center gap-1">
            {isEditMode && (
              <Toggle
                pressed={teamSong?.isFavorite}
                onPressedChange={handleToggleFavorite}
                className="h-8 w-8 data-[state=on]:bg-yellow-50 data-[state=on]:text-yellow-600"
                aria-label={`${contiSong.title} 즐겨찾기 ${teamSong?.isFavorite ? '해제' : '추가'}`}
                onClick={(e) => e.stopPropagation()}
              >
                <Star className={cn('h-4 w-4', teamSong?.isFavorite && 'fill-current')} />
              </Toggle>
            )}
            {!isEditMode && teamSong?.isFavorite && <Star className="h-4 w-4 fill-current text-yellow-600" />}
            {isEditMode && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-neutral-400 transition-all hover:bg-destructive/10 hover:text-destructive md:opacity-0 md:group-hover:opacity-100"
                aria-label={`${contiSong.title} 삭제`}
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove(contiSong.id)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        }
      >
        {isEditMode ? (
          <SongDirectEditCard
            variant="embedded"
            title="찬양 정보 수정"
            submitLabel="변경 적용"
            idPrefix={`conti-song-${contiSong.id}`}
            showCancelButton={false}
            showFooterActions={false}
            initialValue={{
              title: form.title,
              artist: form.artist,
              keySignature: form.keySignature,
              bpm: form.bpm,
              youtubeUrl: form.youtubeUrl,
              sheetMusicUrl: form.sheetMusicUrl,
              note: form.note,
            }}
            initialSongForm={songFormParts}
            onChange={(data) => {
              onChange({
                ...contiSong,
                title: data.title,
                artist: data.artist,
                key: data.keySignature,
                bpm: data.bpm,
                youtubeUrl: data.youtubeUrl,
                sheetMusicUrl: data.sheetMusicUrl,
                note: data.note,
                songForm: mapRequestSongFormToConti(data.songForm),
              })
            }}
            onSave={() => undefined}
            onCancel={() => undefined}
          />
        ) : null}
      </ContiSongCard>
    </div>
  )
}
