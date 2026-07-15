'use client'

import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { ContiSong } from '@/types/conti'
import { ContiSongItem } from './conti-song-item'
import { DND_CONFIG } from '@/constants/ui-constants'

interface ContiSongListProps {
  songs: ContiSong[]
  isEditMode: boolean
  onRemove: (id: string) => void
  onUpdateOrder: (songs: ContiSong[]) => void
  onChangeSong: (song: ContiSong) => void
  sheetMusicChanges: Record<string, { file: File | null; deleteExisting: boolean }>
  onSheetMusicChange: (songId: string, file: File | null) => void
  onSheetMusicDeleteRequest: (songId: string) => void
}

export function ContiSongList({
  songs,
  isEditMode,
  onRemove,
  onUpdateOrder,
  onChangeSong,
  sheetMusicChanges,
  onSheetMusicChange,
  onSheetMusicDeleteRequest,
}: ContiSongListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: isEditMode ? undefined : { distance: DND_CONFIG.DISABLED_POINTER_DISTANCE },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  if (songs.length === 0) {
    return (
      <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed text-center bg-muted/5">
        <p className="type-body-sm text-muted-foreground/60 italic font-medium">추가된 곡이 없습니다.</p>
        <p className="type-body-sm mt-1 text-muted-foreground/40">예배 순서에 맞춰 곡을 추가해보세요.</p>
      </div>
    )
  }

  const handleDragEnd = (event: DragEndEvent) => {
    if (!isEditMode) return

    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = songs.findIndex((song) => song.id === active.id)
    const newIndex = songs.findIndex((song) => song.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    const reordered = arrayMove(songs, oldIndex, newIndex).map((song, index) => ({
      ...song,
      orderIndex: index,
    }))

    onUpdateOrder(reordered)
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={songs.map((song) => song.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {songs.map((song, index) => (
            <ContiSongItem
              key={song.id}
              id={song.id}
              contiSong={song}
              index={index}
              isEditMode={isEditMode}
              onRemove={onRemove}
              onChange={onChangeSong}
              sheetMusicChange={sheetMusicChanges[song.id]}
              onSheetMusicChange={onSheetMusicChange}
              onSheetMusicDeleteRequest={onSheetMusicDeleteRequest}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
