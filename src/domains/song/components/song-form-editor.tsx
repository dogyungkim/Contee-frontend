'use client'

import React, { useState } from 'react'
import {
  DndContext,
  useDroppable,
  closestCorners,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import { SongFormPart } from '@/types/song'
import { AVAILABLE_SECTIONS, getSectionStyle, getSongFormSummary } from '@/domains/song/utils/song-form'
import { Button } from '@/components/ui/button'
import { GripHorizontal, X, Plus, PlusCircle, ChevronDown } from 'lucide-react'
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { DND_CONFIG, SONG_FORM_CONFIG } from '@/constants/ui-constants'

// --- Types ---

interface SongFormEditorProps {
  value: SongFormPart[]
  onChange: (value: SongFormPart[]) => void
}

const VERSE_NUMBER_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8] as const
const BAR_COUNT_OPTIONS = [4, 8, 12, 16, 32] as const
const PART_ID_RANDOM_SUFFIX_LENGTH = 9
const CUSTOM_PART_FALLBACK_LABEL = 'Custom'

const createPartId = () => `part-${Date.now()}-${Math.random().toString(36).slice(2, 2 + PART_ID_RANDOM_SUFFIX_LENGTH)}`

// --- Components ---

function SourceItem({ type, onClick }: { type: SongFormPart['type'], onClick: () => void }) {
  const styleInfo = getSectionStyle(type)

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-w-0 items-center gap-2 rounded-lg border bg-white p-2.5 text-left transition-all hover:border-primary active:scale-[0.98] sm:gap-3 sm:p-3 group",
        "border-gray-200"
      )}
    >
      <PlusCircle className="h-3.5 w-3.5 shrink-0 text-gray-400 group-hover:text-primary sm:h-4 sm:w-4" />
      <div className={cn("h-5 w-1 shrink-0 rounded-full sm:h-6", styleInfo.color)}></div>
      <span className="type-control truncate text-gray-700">{styleInfo.label}</span>
      <span className="type-badge ml-auto hidden text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 sm:inline">Add</span>
    </button>
  )
}

function SortableItem({ part, onRemove, onUpdate }: { part: SongFormPart; onRemove: (id: string) => void; onUpdate: (id: string, updates: Partial<SongFormPart>) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: part.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const styleInfo = getSectionStyle(part.type)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative flex w-full min-w-0 flex-col items-center gap-3 sm:w-auto sm:shrink-0"
    >
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "relative flex h-16 w-full min-w-0 cursor-move flex-col justify-between rounded-lg border-x border-b border-t-4 bg-white p-2 shadow-sm sm:h-20 sm:w-36 sm:p-3",
          styleInfo.border,
          styleInfo.bg,
          "border-gray-200"
        )}
      >
        {part.type === 'Verse' ? (
             <div className="flex items-center gap-1" onPointerDown={(e) => e.stopPropagation()}>
               <span className="type-badge uppercase tracking-wider text-blue-600">Verse</span>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button type="button" className="type-badge h-5 min-w-[28px] rounded border border-blue-200 bg-white px-1 text-blue-600 shadow-sm transition-all hover:bg-blue-50 focus:outline-none focus:ring-1 focus:ring-blue-400 sm:h-6 sm:min-w-[32px]">
                            {(part.label ?? '').replace(/[^0-9]/g, '') || '1'}
                            <ChevronDown className="h-3 w-3 text-blue-400" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-[40px]">
                        {VERSE_NUMBER_OPTIONS.map((num) => (
                            <DropdownMenuItem 
                                key={num} 
                                onClick={() => onUpdate(part.id, { label: `Verse ${num}` })}
                                className="justify-center py-1 cursor-pointer"
                            >
                                {num}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                 </DropdownMenu>
             </div>
        ) : (
            <span className={cn("type-badge uppercase tracking-wider", {
                'text-slate-500': part.type === 'Intro',
                'text-purple-600': part.type === 'Chorus',
            })}>
            {part.label || part.type}
            </span>
        )}
        <div className="flex justify-between items-end">
          {['Intro', 'Interlude', 'Instrumental', 'Outro'].includes(part.type) && (
             <div className="flex items-center gap-1" onPointerDown={(e) => e.stopPropagation()}>
               <div className="relative">
                 <Input 
                   type="number"
                   className="type-badge h-5 w-12 bg-white/50 pl-1 pr-4 text-right transition-colors border-gray-300 focus:bg-white sm:h-6 sm:w-14 sm:pr-5"
                   value={part.bars || ''}
                   onChange={(e) => onUpdate(part.id, { bars: Number.parseInt(e.target.value) || 0 })}
                   min={0}
                   placeholder={`${SONG_FORM_CONFIG.DEFAULT_BARS}`}
                 />
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button type="button" className="absolute right-0 top-0 flex h-full w-5 items-center justify-center rounded-r-md text-gray-500 transition-colors hover:bg-black/5 hover:text-black focus:outline-none">
                            <ChevronDown className="h-3 w-3" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="p-1 min-w-[60px]">
                        {BAR_COUNT_OPTIONS.map((bars) => (
                            <DropdownMenuItem 
                                key={bars} 
                                onClick={() => onUpdate(part.id, { bars })}
                                className="justify-center py-1 cursor-pointer"
                            >
                                {bars} 마디
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                 </DropdownMenu>
               </div>
               <span className="type-badge text-gray-500 whitespace-nowrap">마디</span>
             </div>
          )}
          <GripHorizontal className="ml-auto h-3.5 w-3.5 text-gray-400 sm:h-4 sm:w-4" />
        </div>
        
        <button
            type="button"
          onClick={(e) => {
             e.preventDefault();
             e.stopPropagation();
             onRemove(part.id)
          }}
          onPointerDown={(e) => e.stopPropagation()} 
          className="absolute -right-1.5 -top-1.5 z-10 flex size-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:text-red-500 sm:-right-2 sm:-top-2 sm:size-5 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
          aria-label={`${part.label || part.type} 삭제`}
        >
          <X className="h-3 w-3" />
        </button>
      </div>
       {/* Connector Line */}
       {/* Logic for connector line would go here, simplified for now */}
    </div>
  )
}

// --- Main Editor ---

export function SongFormEditor({ value, onChange }: SongFormEditorProps) {
  const [customPopoverOpen, setCustomPopoverOpen] = useState(false)
  const [customForm, setCustomForm] = useState<{
    abbr: string
    label: string
    bars: number
  }>({
    abbr: '',
    label: '',
    bars: SONG_FORM_CONFIG.DEFAULT_BARS
  })

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: DND_CONFIG.SONG_FORM_MOUSE_DISTANCE },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: DND_CONFIG.SONG_FORM_TOUCH_DELAY,
        tolerance: DND_CONFIG.SONG_FORM_TOUCH_TOLERANCE,
      },
    }),
  )

  const addItem = (type: SongFormPart['type']) => {
    // Auto-label logic (e.g., Verse 1, Verse 2)
    // Chorus and Bridge typically don't have numbers
    const count = value.filter(v => v.type === type).length + 1
    const sectionInfo = getSectionStyle(type)
    const needsNumber = type === 'Verse' || type === 'Interlude' || type === 'Tag'
    const label = needsNumber ? `${sectionInfo.label} ${count}` : sectionInfo.label

    const newItem: SongFormPart = {
      id: createPartId(),
      type,
      label,
      bars: SONG_FORM_CONFIG.DEFAULT_BARS, // default
    }
    
    onChange([...value, newItem])
  }

  const handleAddCustom = () => {
    const newItem: SongFormPart = {
      id: createPartId(),
      type: 'Verse', // Use Verse as default type for styling
      label: customForm.label || customForm.abbr || CUSTOM_PART_FALLBACK_LABEL,
      bars: customForm.bars,
      abbr: customForm.abbr, // Store custom abbreviation for flow
    }
    onChange([...value, newItem])
    setCustomPopoverOpen(false)
    // Reset form
    setCustomForm({
      abbr: '',
      label: '',
      bars: SONG_FORM_CONFIG.DEFAULT_BARS
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    // Sorting existing list
    if (active.id !== over.id) {
      const oldIndex = value.findIndex((item) => item.id === active.id)
      const newIndex = value.findIndex((item) => item.id === over.id)
      onChange(arrayMove(value, oldIndex, newIndex))
    }
  }

  const handleRemove = (id: string) => {
    onChange(value.filter(v => v.id !== id))
  }

  const handleUpdate = (id: string, updates: Partial<SongFormPart>) => {
    onChange(value.map(v => v.id === id ? { ...v, ...updates } : v))
  }

  // Use shared summary logic
  const groupedFlow = getSongFormSummary(value)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className="grid h-full min-h-0 gap-2 p-1 sm:gap-4 lg:grid-cols-12 lg:gap-6">
        {/* Sidebar: Available Sections */}
        <aside className="flex min-h-0 flex-col lg:col-span-3">
          <div className="flex h-[30dvh] min-h-[220px] max-h-[300px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm sm:h-auto sm:max-h-[260px] lg:h-full lg:max-h-none">
            <div className="shrink-0 border-b border-gray-100 p-3 sm:p-4">
              <h3 className="type-panel-title">송폼 컴포넌트</h3>
              <p className="type-badge mt-0.5 text-gray-500 sm:mt-1">클릭하여 송폼에 추가</p>
            </div>
            
            <div className="custom-scrollbar grid flex-1 grid-cols-2 gap-1.5 overflow-y-auto p-2.5 sm:gap-2 sm:p-4 lg:flex lg:flex-col">
              {AVAILABLE_SECTIONS.map((section) => (
                <SourceItem key={section.type} type={section.type} onClick={() => addItem(section.type)} />
              ))}
            </div>
            
            <div className="shrink-0 border-t border-gray-100 p-2.5 sm:p-4">
                <Popover open={customPopoverOpen} onOpenChange={setCustomPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="type-control h-8 w-full gap-1.5 sm:h-9 sm:gap-2">
                        <Plus className="h-3 w-3" />
                        커스텀 추가
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[calc(100vw-2rem)] sm:w-72" align="center" side="bottom">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="type-body-sm font-medium">커스텀 섹션</h4>
                        <p className="type-body-sm text-muted-foreground">자유롭게 섹션을 만들 수 있습니다</p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="custom-abbr">약어 (송폼 요약)</Label>
                          <Input 
                            id="custom-abbr"
                            type="text"
                            placeholder="예: S, Solo"
                            className="h-8"
                            value={customForm.abbr}
                            onChange={(e) => setCustomForm(prev => ({ ...prev, abbr: e.target.value }))}
                          />
                        </div>
                        
                        <div className="space-y-1.5">
                          <Label htmlFor="custom-label">라벨 (타임라인 표시)</Label>
                          <Input 
                            id="custom-label"
                            type="text"
                            placeholder="예: Solo, Guitar Solo"
                            className="h-8"
                            value={customForm.label}
                            onChange={(e) => setCustomForm(prev => ({ ...prev, label: e.target.value }))}
                          />
                        </div>
                        
                        <div className="space-y-1.5">
                          <Label htmlFor="custom-bars">마디</Label>
                          <Input 
                            id="custom-bars"
                            type="number"
                            min={0}
                            className="h-8"
                            value={customForm.bars}
                            onChange={(e) => setCustomForm(prev => ({ ...prev, bars: Number.parseInt(e.target.value) || 0 }))}
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => setCustomPopoverOpen(false)}>
                          취소
                        </Button>
                        <Button size="sm" className="flex-1" onClick={handleAddCustom}>
                          추가
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
            </div>
          </div>
        </aside>

        {/* Main Canvas: Timeline */}
        <div className="flex h-[38dvh] min-h-[280px] max-h-[420px] flex-col sm:h-auto sm:min-h-[360px] sm:max-h-none lg:col-span-9 lg:min-h-0">
          <div className="flex h-full min-h-0 flex-col rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-2 border-b border-gray-100 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <h2 className="type-panel-title">송폼</h2>
              <div className="grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-2 sm:flex sm:w-auto sm:shrink-0">
                <div className="type-badge flex h-7 items-center gap-1.5 rounded-full bg-gray-100 px-2.5 text-gray-600 sm:h-auto sm:gap-2 sm:px-3 sm:py-1.5">
                   {value.length} Parts
                </div>
                {value.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 w-full sm:h-7 sm:w-auto"
                    onClick={() => onChange([])}
                  >
                    전체 삭제
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8">
                <SortableContext items={value.map(v => v.id)} strategy={rectSortingStrategy}>
                    <div className="min-h-[120px]" id="timeline-droppable"> 
                         {/* We need a droppable area even if empty. SortableContext acts as one if items exist, but if empty we need a wrapper? 
                            Actually, `useDroppable` isn't strictly needed for the Sortable list itself if we handle `over` properly, but to drop *into* it from the sidebar, we might want it.
                         */}
                         <DroppableArea items={value} onRemove={handleRemove} onUpdate={handleUpdate} />
                    </div>
                </SortableContext>
            </div>
            {/* Flow Summary - Read Only */}
            <div className="flex shrink-0 flex-col gap-1.5 rounded-b-xl border-t border-gray-100 bg-gray-50 px-3 py-2.5 sm:flex-row sm:items-center sm:gap-4 sm:px-6 sm:py-4">
                <span className="type-badge shrink-0 uppercase tracking-widest text-gray-400">송폼 요약</span>
                <div className="type-body-sm flex min-w-0 flex-wrap items-center gap-1.5 font-mono font-medium text-gray-600 sm:gap-2">
                    {groupedFlow.map((group, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <span className={cn({
                                'text-primary font-bold': group.type === 'Chorus',
                                'text-slate-600': group.type !== 'Chorus'
                            })}>
                                {group.abbr}
                                {group.showBars && <span className="type-badge ml-1 text-gray-500 font-normal">({group.bars})</span>}
                                {group.count > 1 && <span className="type-badge ml-1 bg-gray-200 px-1 rounded text-gray-500">x{group.count}</span>}
                            </span>
                            {index < groupedFlow.length - 1 && <span className="text-gray-300">→</span>}
                        </div>
                    ))}
                    {value.length === 0 && <span className="text-gray-400 italic">송폼 컴포넌트를 추가해주세요.</span>}
                </div>
            </div>
          </div>
        </div>
      </div>


    </DndContext>
  )
}

function DroppableArea({ items, onRemove, onUpdate }: { items: SongFormPart[], onRemove: (id: string) => void, onUpdate: (id: string, updates: Partial<SongFormPart>) => void }) {
    const { setNodeRef } = useDroppable({
        id: 'timeline-droppable',
    });

    return (
        <div ref={setNodeRef} className="grid h-full w-full grid-cols-1 content-start gap-3 pb-2 min-[360px]:grid-cols-2 sm:flex sm:flex-wrap sm:gap-4 sm:pb-0">
            {items.map((part) => (
                <div key={part.id} className="min-w-0">
                  <SortableItem part={part} onRemove={onRemove} onUpdate={onUpdate} />
                  {/* Visual connector line could act as 'gap' */}
                  {/* <div className="h-1 w-8 bg-gray-200 rounded-full mt-10" />  Thinking about layout */}
                </div>
            ))}
             {items.length === 0 && (
                 <div className="col-span-full flex h-28 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-gray-300 sm:w-36">
                    <PlusCircle className="h-6 w-6" />
                </div>
             )}
        </div>
    )
}
