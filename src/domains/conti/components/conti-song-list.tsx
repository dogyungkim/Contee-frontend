'use client'

import { useState, useEffect, useCallback } from 'react'
import { Music, X, GripVertical, Youtube, FileText, Star, MessageSquare, Plus, Minus, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'
import { ContiSong } from '@/types/conti'
import { SongFormPart, ApiSongFormPart } from '@/types/song'
import { getSongFormSummary } from '@/domains/song/utils/song-form'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Toggle } from '@/components/ui/toggle'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUpdateContiSongDetail } from '../hooks/use-conti'
import { useUpdateTeamSong } from '@/domains/song/hooks/use-songs'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'

const COMMON_KEYS = [
  'C', 'C#', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'
]

interface SortableSongItemProps {
  id: string
  contiId: string
  contiSong: ContiSong
  index: number
  isEditMode: boolean
  onRemove: (id: string) => void
}

function SortableSongItem({ id, contiId, contiSong, index, isEditMode, onRemove }: SortableSongItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const { mutate: updateDetail } = useUpdateContiSongDetail()
  const { mutate: updateTeamSong } = useUpdateTeamSong()

  const [form, setForm] = useState({
    keySignature: '',
    bpm: 0,
    note: '',
  })
  
  const teamSong = contiSong.teamSong

  const [isTeamNoteOpen, setIsTeamNoteOpen] = useState(false)

  // Convert API song form to UI song form
  const convertApiSongFormToUi = (apiParts: ApiSongFormPart[]): SongFormPart[] => {
    return apiParts.map((part, index) => ({
      id: `${part.id || index}`,
      type: convertPartType(part.partType),
      label: part.customPartName || part.partType,
      bars: 8, // Default, API doesn't provide bars
      abbr: part.customPartName ? part.customPartName.substring(0, 3) : undefined
    }))
  }

  // Convert backend part type to UI part type
  const convertPartType = (apiType: string): SongFormPart['type'] => {
    const typeMap: Record<string, SongFormPart['type']> = {
      'INTRO': 'Intro',
      'VERSE': 'Verse',
      'PRE_CHORUS': 'Pre-chorus',
      'CHORUS': 'Chorus',
      'BRIDGE': 'Bridge',
      'INTERLUDE': 'Interlude',
      'OUTRO': 'Outro',
      'TAG': 'Tag',
      'INSTRUMENTAL': 'Instrumental',
    }
    return typeMap[apiType] || 'Intro'
  }

  const songFormParts = contiSong.songForm ? convertApiSongFormToUi(contiSong.songForm) : []
  const groupedFlow = getSongFormSummary(songFormParts)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 1,
    opacity: isDragging ? 0.5 : 1,
  }
  
  // Initialize form when song changes
  useEffect(() => {
    setForm({
      keySignature: contiSong.keyOverride || '',
      bpm: contiSong.bpmOverride || 0,
      note: contiSong.note || '',
    })
  }, [contiSong])

  // Checking for overrides
  const isKeyOverridden = !!form.keySignature && form.keySignature !== teamSong?.keySignature
  const isBpmOverridden = !!form.bpm && form.bpm !== teamSong?.bpm
  const isNoteOverridden = !!form.note

  // Auto-save logic with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only save if values differ from current contiSong
      if (
        form.keySignature !== (contiSong.keyOverride || '') ||
        form.bpm !== (contiSong.bpmOverride || 0) ||
        form.note !== (contiSong.note || '')
      ) {
        updateDetail({
          contiId: contiId,
          contiSongId: contiSong.id,
          request: {
            keyOverride: form.keySignature,
            bpmOverride: form.bpm,
            contiNote: form.note
          }
        })
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [form, contiSong, updateDetail, contiId])

  const handleToggleFavorite = () => {
    if (!teamSong) return
    updateTeamSong({
      teamId: teamSong.teamId,
      songId: teamSong.id,
      request: { isFavorite: !teamSong.isFavorite }
    })
  }

  const resetField = (field: 'keySignature' | 'bpm') => {
    if (!teamSong) return
    setForm(prev => ({ ...prev, [field]: teamSong[field] || (field === 'bpm' ? 0 : '') }))
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div 
        className={cn(
          "group relative rounded-xl border bg-white transition-all overflow-hidden",
          "border-neutral-200 hover:border-neutral-300 shadow-sm",
          isDragging && "shadow-xl border-primary"
        )}
      >
        {/* Header Section: Index, Title, Metadata */}
        <div className="px-4 py-3 bg-neutral-50/50 border-b border-neutral-100 flex items-center gap-4">
          {/* Drag Handle & Index */}
          <div className="flex items-center gap-2">
            {isEditMode && (
              <div 
                {...attributes} 
                {...listeners} 
                className="cursor-grab active:cursor-grabbing p-1.5 -ml-1 hover:bg-neutral-200 rounded text-neutral-400 hover:text-neutral-600 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="h-4 w-4" />
              </div>
            )}
            <span className="w-6 h-6 rounded bg-neutral-200 flex items-center justify-center text-xs font-mono font-bold text-neutral-600">
              {index + 1}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-base truncate">
              {contiSong.customTitle || contiSong.songTitle}
            </h4>
            {/* Show original title if custom title exists and is different */}
            {(contiSong.customTitle && contiSong.customTitle !== contiSong.songTitle) && (
              <p className="text-xs text-muted-foreground truncate -mt-0.5 mb-1">
                Orig: {contiSong.songTitle}
              </p>
            )}
            <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
              <span className={cn("flex items-center gap-1", isKeyOverridden && "text-amber-600 font-medium")}>
                <Music className="h-3 w-3" />
                {form.keySignature || '-'}
                {isKeyOverridden && <span className="opacity-50 text-[10px]">({teamSong?.keySignature})</span>}
              </span>
              <Separator orientation="vertical" className="h-3" />
              <span className={cn("flex items-center gap-1", isBpmOverridden && "text-amber-600 font-medium")}>
                <div className="text-[10px] font-bold">BPM</div>
                {form.bpm || '-'}
                {isBpmOverridden && <span className="opacity-50 text-[10px]">({teamSong?.bpm})</span>}
              </span>
              {teamSong?.artist && (
                <>
                  <Separator orientation="vertical" className="h-3" />
                  <span className="truncate max-w-[100px]">{teamSong.artist}</span>
                </>
              )}
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-1">
            {isEditMode && (
              <Toggle 
                pressed={teamSong?.isFavorite} 
                onPressedChange={handleToggleFavorite}
                className="h-8 w-8 data-[state=on]:bg-yellow-50 data-[state=on]:text-yellow-600"
                onClick={(e) => e.stopPropagation()}
              >
                <Star className={cn("h-4 w-4", teamSong?.isFavorite && "fill-current")} />
              </Toggle>
            )}
            {!isEditMode && teamSong?.isFavorite && (
              <Star className="h-4 w-4 text-yellow-600 fill-current" />
            )}
            {isEditMode && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-neutral-400 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove(contiSong.id)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Details Section - Always Visible */}
        <div className="px-4 py-4 space-y-4 bg-white">
            {/* Key & BPM Controls */}
            <div className="grid grid-cols-2 gap-4">
              {/* Key Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Key (조성)</Label>
                  {isEditMode && isKeyOverridden && (
                    <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground" onClick={() => resetField('keySignature')}>
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <Select 
                  value={form.keySignature} 
                  onValueChange={(val) => setForm(prev => ({ ...prev, keySignature: val }))}
                  disabled={!isEditMode}
                >
                  <SelectTrigger className={cn("w-full transition-colors", isEditMode && isKeyOverridden && "bg-yellow-50 border-yellow-200 font-bold")}>
                    <SelectValue placeholder="키 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_KEYS.map(k => (
                      <SelectItem key={k} value={k}>{k}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground px-1">
                  팀 기본: <span className="font-medium">{teamSong?.keySignature || '없음'}</span>
                </p>
              </div>

              {/* BPM */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tempo (BPM)</Label>
                  {isEditMode && isBpmOverridden && (
                    <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground" onClick={() => resetField('bpm')}>
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isEditMode && (
                    <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={() => setForm(prev => ({ ...prev, bpm: prev.bpm - 1 }))}>
                      <Minus className="h-3 w-3" />
                    </Button>
                  )}
                  <Input 
                    type="number" 
                    value={form.bpm || ''} 
                    onChange={(e) => setForm(prev => ({ ...prev, bpm: Number(e.target.value) }))}
                    disabled={!isEditMode}
                    className={cn("text-center transition-colors px-2", isEditMode && isBpmOverridden && "bg-yellow-50 border-yellow-200 font-bold font-mono")}
                  />
                  {isEditMode && (
                    <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={() => setForm(prev => ({ ...prev, bpm: prev.bpm + 1 }))}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground px-1">
                  팀 기본: <span className="font-medium">{teamSong?.bpm || '없음'}</span>
                </p>
              </div>
            </div>

            {/* Conti Note */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">콘티 메모</Label>
              <Textarea 
                placeholder="이 예배에서만 참고할 사항을 입력하세요."
                className={cn(
                  "min-h-[80px] resize-none transition-colors text-sm",
                  "disabled:opacity-100 disabled:cursor-default disabled:bg-muted/30 disabled:border-0 disabled:shadow-none",
                  isEditMode && isNoteOverridden && "bg-yellow-50/50 border-yellow-100"
                )}
                value={form.note}
                onChange={(e) => setForm(prev => ({ ...prev, note: e.target.value }))}
                disabled={!isEditMode}
              />
            </div>

            {/* Song Form and Team Note */}
            {(songFormParts.length > 0 || teamSong?.note) && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">팀 곡 정보 (공유)</Label>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1" onClick={() => setIsTeamNoteOpen(!isTeamNoteOpen)}>
                    {isTeamNoteOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    {isTeamNoteOpen ? '접기' : '전체 보기'}
                  </Button>
                </div>
                
                <div className={cn(
                  "relative rounded-md border bg-muted/30 p-3 transition-all duration-200 overflow-hidden space-y-3",
                  isTeamNoteOpen ? "max-h-[500px]" : "max-h-32"
                )}>
                  {/* Song Form Display */}
                  {songFormParts.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                      {groupedFlow.map((group, index) => (
                          <div key={index} className="flex items-center gap-1.5 shrink-0">
                                <div className={cn("px-2 py-1 rounded text-xs font-bold border shadow-sm whitespace-nowrap", {
                                    'bg-blue-50 border-blue-200 text-blue-700': group.type === 'Verse',
                                    'bg-purple-50 border-purple-200 text-purple-700': group.type === 'Chorus',
                                    'bg-slate-50 border-slate-200 text-slate-700': group.type === 'Intro' || group.type === 'Outro',
                                    'bg-amber-50 border-amber-200 text-amber-700': group.type === 'Bridge',
                                    'bg-emerald-50 border-emerald-200 text-emerald-700': group.type === 'Instrumental',
                                    'bg-rose-50 border-rose-200 text-rose-700': group.type === 'Tag',
                                    'bg-cyan-50 border-cyan-200 text-cyan-700': group.type === 'Interlude',
                                })}>
                                    {group.abbr}
                                    {group.showBars && <span className="ml-1 text-[10px] opacity-70 font-normal">({group.bars})</span>}
                                    {group.count > 1 && <span className="ml-1 text-[9px] bg-black/10 px-1 rounded opacity-70">x{group.count}</span>}
                                </div>
                                {index < groupedFlow.length - 1 && <span className="text-slate-300 text-[10px]">→</span>}
                          </div>
                      ))}
                    </div>
                  )}

                  {/* Text Note */}
                  {teamSong?.note && (
                     <div className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
                       {teamSong.note}
                     </div>
                  )}

                  {!isTeamNoteOpen && (
                    <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-muted/30 to-transparent" />
                  )}
                </div>
              </div>
            )}

            {/* Links */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">빠른 링크</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="secondary" 
                  disabled={!teamSong?.sheetMusicUrl} 
                  className="h-9 gap-2 text-sm"
                  asChild={!!(teamSong?.sheetMusicUrl)}
                >
                  {(teamSong?.sheetMusicUrl) ? (
                    <a href={teamSong?.sheetMusicUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="h-4 w-4" /> 악보 보기
                    </a>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" /> 악보 보기
                    </>
                  )}
                </Button>
                <Button 
                  variant="secondary" 
                  disabled={!teamSong?.youtubeUrl} 
                  className="h-9 gap-2 text-sm"
                  asChild={!!(teamSong?.youtubeUrl)}
                >
                  {(teamSong?.youtubeUrl) ? (
                    <a href={teamSong?.youtubeUrl} target="_blank" rel="noopener noreferrer">
                      <Youtube className="h-4 w-4 text-red-500" /> 유튜브
                    </a>
                  ) : (
                    <>
                      <Youtube className="h-4 w-4" /> 유튜브
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
      </div>
    </div>
  )
}

interface ContiSongListProps {
  contiId: string
  songs: ContiSong[]
  isEditMode: boolean
  onRemove: (id: string) => void
  onUpdateOrder: (songs: ContiSong[]) => void
}

export function ContiSongList({ contiId, songs, isEditMode, onRemove, onUpdateOrder }: ContiSongListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: isEditMode ? undefined : { distance: 999999 }, // Effectively disable in view mode
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  if (songs.length === 0) {
    return (
      <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed text-center bg-muted/5">
        <p className="text-sm text-muted-foreground/60 italic font-medium">추가된 곡이 없습니다.</p>
        <p className="text-xs text-muted-foreground/40 mt-1">예배 순서에 맞춰 곡을 추가해보세요.</p>
      </div>
    )
  }

  const handleDragEnd = (event: DragEndEvent) => {
    if (!isEditMode) return // Don't process drag events in view mode
    
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = songs.findIndex((s) => s.id === active.id)
      const newIndex = songs.findIndex((s) => s.id === over.id)
      
      const newArray = arrayMove(songs, oldIndex, newIndex)
      const reorderedArray = newArray.map((song, index) => ({
        ...song,
        orderIndex: index,
      }))
      
      onUpdateOrder(reorderedArray)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={songs.map(s => s.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {songs.map((song, index) => (
            <SortableSongItem 
              key={song.id} 
              id={song.id} 
              contiId={contiId}
              contiSong={song} 
              index={index} 
              isEditMode={isEditMode}
              onRemove={onRemove}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
