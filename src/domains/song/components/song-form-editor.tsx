'use client'

import React, { useState } from 'react' // Import useState
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  closestCorners,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
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
import { Button } from '@/components/ui/button'
import { GripVertical, GripHorizontal, X, Plus, PlusCircle, ChevronDown } from 'lucide-react'
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// --- Types ---

interface SongFormEditorProps {
  value: SongFormPart[]
  onChange: (value: SongFormPart[]) => void
}

// Fixed definitions for available sections
export const AVAILABLE_SECTIONS: { type: SongFormPart['type']; label: string; abbr: string; color: string; bg: string; border: string }[] = [
  { type: 'Intro', label: 'Intro', abbr: 'Intro', color: 'bg-slate-300', bg: 'bg-slate-50', border: 'border-slate-300' },
  { type: 'Verse', label: 'Verse', abbr: 'V', color: 'bg-blue-400', bg: 'bg-blue-50', border: 'border-blue-400' },
  { type: 'Chorus', label: 'Chorus', abbr: 'C', color: 'bg-purple-400', bg: 'bg-purple-50', border: 'border-purple-400' },
  { type: 'Bridge', label: 'Bridge', abbr: 'B', color: 'bg-amber-400', bg: 'bg-amber-50', border: 'border-amber-400' },
  { type: 'Instrumental', label: 'Instrumental', abbr: 'Inst', color: 'bg-emerald-400', bg: 'bg-emerald-50', border: 'border-emerald-400' },
  { type: 'Interlude', label: 'Interlude', abbr: 'Inter', color: 'bg-cyan-400', bg: 'bg-cyan-50', border: 'border-cyan-400' },
  { type: 'Tag', label: 'Tag', abbr: 'Tag', color: 'bg-rose-400', bg: 'bg-rose-50', border: 'border-rose-400' },
  { type: 'Outro', label: 'Outro', abbr: 'Outro', color: 'bg-gray-400', bg: 'bg-gray-50', border: 'border-gray-400' }
]

export const getSectionStyle = (type: SongFormPart['type']) => {
  return AVAILABLE_SECTIONS.find(s => s.type === type) || AVAILABLE_SECTIONS[0]
}

// --- Components ---

function SourceItem({ type, onClick }: { type: SongFormPart['type'], onClick: () => void }) {
  const styleInfo = getSectionStyle(type)

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border hover:border-primary transition-all group bg-white w-full text-left active:scale-[0.98]",
        "border-gray-200"
      )}
    >
      <PlusCircle className="h-4 w-4 text-gray-400 group-hover:text-primary shrink-0" />
      <div className={cn("w-1 h-6 rounded-full shrink-0", styleInfo.color)}></div>
      <span className="text-sm font-medium text-gray-700 truncate">{styleInfo.label}</span>
      <span className="ml-auto text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">Add</span>
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
      className="flex-shrink-0 flex flex-col items-center gap-3 group relative"
    >
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "w-36 h-20 border-t-4 border-x border-b rounded-lg p-3 flex flex-col justify-between shadow-sm cursor-move relative bg-white",
          styleInfo.border,
          styleInfo.bg,
          "border-gray-200"
        )}
      >
        {part.type === 'Verse' ? (
             <div className="flex items-center gap-1" onPointerDown={(e) => e.stopPropagation()}>
               <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Verse</span>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="h-5 min-w-[28px] px-1 rounded bg-white hover:bg-blue-50 border border-blue-200 flex items-center justify-center gap-0.5 text-[10px] font-bold text-blue-600 shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-blue-400">
                            {(part.label ?? '').replace(/[^0-9]/g, '') || '1'}
                            <ChevronDown className="h-3 w-3 text-blue-400" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-[40px]">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                            <DropdownMenuItem 
                                key={num} 
                                onClick={() => onUpdate(part.id, { label: `Verse ${num}` })}
                                className="justify-center text-xs py-1 cursor-pointer"
                            >
                                {num}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                 </DropdownMenu>
             </div>
        ) : (
            <span className={cn("text-[10px] font-bold uppercase tracking-wider", {
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
                   className="h-6 w-14 text-xs pl-1 pr-5 text-right bg-white/50 border-gray-300 focus:bg-white transition-colors"
                   value={part.bars || ''}
                   onChange={(e) => onUpdate(part.id, { bars: parseInt(e.target.value) || 0 })}
                   min={0}
                   placeholder="8"
                 />
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="absolute right-0 top-0 h-full w-5 flex items-center justify-center text-gray-500 hover:text-black hover:bg-black/5 rounded-r-md transition-colors focus:outline-none">
                            <ChevronDown className="h-3 w-3" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="p-1 min-w-[60px]">
                        {[4, 8, 12, 16, 32].map((bars) => (
                            <DropdownMenuItem 
                                key={bars} 
                                onClick={() => onUpdate(part.id, { bars })}
                                className="justify-center text-xs py-1 cursor-pointer"
                            >
                                {bars} 마디
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                 </DropdownMenu>
               </div>
               <span className="text-xs text-gray-500 font-medium whitespace-nowrap">마디</span>
             </div>
          )}
          <GripHorizontal className="h-4 w-4 text-gray-400 ml-auto" />
        </div>
        
        <button
            type="button"
          onClick={(e) => {
             e.preventDefault();
             e.stopPropagation();
             onRemove(part.id)
          }}
          onPointerDown={(e) => e.stopPropagation()} 
          className="absolute -top-2 -right-2 size-5 bg-white border border-gray-200 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 shadow-sm z-10"
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
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeItem, setActiveItem] = useState<SongFormPart | null>(null)
  const [customPopoverOpen, setCustomPopoverOpen] = useState(false)
  const [customForm, setCustomForm] = useState<{
    abbr: string
    label: string
    bars: number
  }>({
    abbr: '',
    label: '',
    bars: 8
  })

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  )

  const addItem = (type: SongFormPart['type']) => {
    // Auto-label logic (e.g., Verse 1, Verse 2)
    // Chorus and Bridge typically don't have numbers
    const count = value.filter(v => v.type === type).length + 1
    const sectionInfo = getSectionStyle(type)
    const needsNumber = type === 'Verse' || type === 'Interlude' || type === 'Tag'
    const label = needsNumber ? `${sectionInfo.label} ${count}` : sectionInfo.label

    const newItem: SongFormPart = {
      id: `part-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      label,
      bars: 8, // default
    }
    
    onChange([...value, newItem])
  }

  const handleAddCustom = () => {
    const newItem: SongFormPart = {
      id: `part-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'Verse', // Use Verse as default type for styling
      label: customForm.label || customForm.abbr || 'Custom',
      bars: customForm.bars,
      abbr: customForm.abbr, // Store custom abbreviation for flow
    }
    onChange([...value, newItem])
    setCustomPopoverOpen(false)
    // Reset form
    setCustomForm({
      abbr: '',
      label: '',
      bars: 8
    })
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    const item = value.find((item) => item.id === event.active.id)
    if (item) setActiveItem(item)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setActiveItem(null)

    if (!over) return

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

  // Group consecutive parts of the same type for Flow Summary
  const groupedFlow = value.reduce((acc: { type: string, abbr: string, count: number, showBars: boolean, bars: number }[], part) => {
    const section = AVAILABLE_SECTIONS.find(s => s.type === part.type);
    // Use custom abbr if provided, otherwise use section abbr
    let abbr = part.abbr || section?.abbr || part.type;
    const showBars = ['Intro', 'Interlude', 'Instrumental', 'Outro'].includes(part.type);

    // If Verse, Interlude, or Tag, attempt to extract number from label (Verse 1 -> V1)
    // Chorus and Bridge typically don't have numbers
    // Skip this if custom abbr is provided
    if (!part.abbr && ['Verse', 'Interlude', 'Tag'].includes(part.type)) {
        const num = (part.label || '').replace(/[^0-9]/g, '');
        if (num) abbr = `${abbr}${num}`;
    }
    
    // Group only if same type, same abbreviation (handles V1 vs V2), and not a 'showBars' section
    if (acc.length > 0 && acc[acc.length - 1].type === part.type && acc[acc.length - 1].abbr === abbr && !showBars) {
      acc[acc.length - 1].count += 1;
    } else {
      acc.push({ type: part.type, abbr: abbr, count: 1, showBars, bars: part.bars || 8 });
    }
    return acc;
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-12 gap-6 h-full p-1">
        {/* Sidebar: Available Sections */}
        <aside className="col-span-3 flex flex-col min-h-0">
          <div className="bg-white border border-gray-200 rounded-xl flex flex-col shadow-sm h-full overflow-hidden">
            <div className="p-4 border-b border-gray-100 shrink-0">
              <h3 className="font-bold text-sm">송폼 컴포넌트</h3>
              <p className="text-xs text-gray-500 mt-1">클릭하여 송폼에 추가</p>
            </div>
            
            <div className="p-4 flex flex-col gap-2 overflow-y-auto flex-1 custom-scrollbar">
              {AVAILABLE_SECTIONS.map((section) => (
                <SourceItem key={section.type} type={section.type} onClick={() => addItem(section.type)} />
              ))}
            </div>
            
            <div className="p-4 border-t border-gray-100 shrink-0">
                <Popover open={customPopoverOpen} onOpenChange={setCustomPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full text-xs gap-2">
                        <Plus className="h-3 w-3" />
                        커스텀 추가
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72" align="end" side="right">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">커스텀 섹션</h4>
                        <p className="text-xs text-muted-foreground">자유롭게 섹션을 만들 수 있습니다</p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="custom-abbr" className="text-xs">약어 (송폼 요약)</Label>
                          <Input 
                            id="custom-abbr"
                            type="text"
                            placeholder="예: S, Solo"
                            className="h-8 text-xs"
                            value={customForm.abbr}
                            onChange={(e) => setCustomForm(prev => ({ ...prev, abbr: e.target.value }))}
                          />
                        </div>
                        
                        <div className="space-y-1.5">
                          <Label htmlFor="custom-label" className="text-xs">라벨 (타임라인 표시)</Label>
                          <Input 
                            id="custom-label"
                            type="text"
                            placeholder="예: Solo, Guitar Solo"
                            className="h-8 text-xs"
                            value={customForm.label}
                            onChange={(e) => setCustomForm(prev => ({ ...prev, label: e.target.value }))}
                          />
                        </div>
                        
                        <div className="space-y-1.5">
                          <Label htmlFor="custom-bars" className="text-xs">마디</Label>
                          <Input 
                            id="custom-bars"
                            type="number"
                            min={0}
                            className="h-8 text-xs"
                            value={customForm.bars}
                            onChange={(e) => setCustomForm(prev => ({ ...prev, bars: parseInt(e.target.value) || 0 }))}
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setCustomPopoverOpen(false)}>
                          취소
                        </Button>
                        <Button size="sm" className="flex-1 text-xs" onClick={handleAddCustom}>
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
        <div className="col-span-9 flex flex-col min-h-0">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col h-full min-h-0">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold">송폼</h2>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-xs bg-gray-100 px-3 py-1.5 rounded-full font-medium text-gray-600">
                   {value.length} Parts
                </div>
                {value.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-7"
                    onClick={() => onChange([])}
                  >
                    전체 삭제
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex-1 p-8 overflow-y-auto">
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
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-xl flex items-center gap-4 overflow-x-auto shrink-0">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest shrink-0">송폼 요약</span>
                <div className="flex items-center gap-2 text-sm font-mono font-medium text-gray-600">
                    {groupedFlow.map((group, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <span className={cn({
                                'text-primary font-bold': group.type === 'Chorus',
                                'text-slate-600': group.type !== 'Chorus'
                            })}>
                                {group.abbr}
                                {group.showBars && <span className="ml-1 text-xs text-gray-500 font-normal">({group.bars})</span>}
                                {group.count > 1 && <span className="ml-1 text-[10px] bg-gray-200 px-1 rounded text-gray-500">x{group.count}</span>}
                            </span>
                            {index < groupedFlow.length - 1 && <span className="text-gray-300">→</span>}
                        </div>
                    ))}
                    {value.length === 0 && <span className="text-gray-400 italic">왼쪽에서 컴포넌트를 추가해주세요.</span>}
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
        <div ref={setNodeRef} className="flex flex-wrap gap-4 h-full w-full">
            {items.map((part) => (
                <div key={part.id}>
                  <SortableItem part={part} onRemove={onRemove} onUpdate={onUpdate} />
                  {/* Visual connector line could act as 'gap' */}
                  {/* <div className="h-1 w-8 bg-gray-200 rounded-full mt-10" />  Thinking about layout */}
                </div>
            ))}
             {items.length === 0 && (
                 <div className="w-32 h-28 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-300">
                    <PlusCircle className="h-6 w-6" />
                </div>
             )}
        </div>
    )
}
