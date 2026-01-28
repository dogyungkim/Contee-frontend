'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Plus, Save, Music, ChevronLeft } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useTeam } from '@/context/team-context'
import { useNewContiForm } from '@/domains/conti/hooks/use-new-conti-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SongSearchDialog } from '@/domains/conti/components/song-search-dialog'
 import { SongDirectEditCard } from '@/domains/conti/components/song-direct-edit-card'
import { cn } from '@/lib/utils'
import Link from 'next/link'

// Time Constants
const PERIODS = [
  { label: "오전", value: "AM" },
  { label: "오후", value: "PM" }
]

const HOURS = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'))
const MINUTES = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'))

export default function NewContiPage() {
  const router = useRouter()
  const { selectedTeamId, selectedTeam } = useTeam()
  
  // Use the custom hook for all business logic
  const {
    date,
    setDate,
    period,
    setPeriod,
    hour,
    setHour,
    minute,
    setMinute,
    title,
    setTitle,
    memo,
    setMemo,
    tempSongs,
    addExistingSong,
    addNewSong,
    removeSong,
    handleSave,
    isSaving,
  } = useNewContiForm(selectedTeamId)
  
  // UI State (kept in component as it's purely UI-related)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchTab, setSearchTab] = useState<'team' | 'new'>('team')
  const [isAddingNewSong, setIsAddingNewSong] = useState(false)

  if (!selectedTeamId || !selectedTeam) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center space-y-4 rounded-lg border border-dashed text-center">
        <p className="text-muted-foreground">선택된 팀이 없습니다.</p>
        <p className="text-sm text-muted-foreground">먼저 팀을 선택하거나 생성해주세요.</p>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col -m-6 sm:-m-8">
      {/* Top Header Section */}
      <div className="bg-background border-b px-6 sm:px-8 py-4 shrink-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between max-w-[1600px] mx-auto w-full">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                <Link href="/dashboard/contis">
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h2 className="text-xl font-bold tracking-tight">새 콘티 만들기</h2>
            </div>
            <p className="text-sm text-muted-foreground ml-10">
              {selectedTeam.name} 팀의 예배 콘티를 작성합니다.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9"
              onClick={() => router.back()}
            >
              취소
            </Button>
            <Button 
              className="h-9 gap-2" 
              onClick={handleSave}
              disabled={isSaving || !title.trim()}
            >
              <Save className="h-4 w-4" />
              {isSaving ? '저장 중...' : '저장하기'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-6 max-w-[1200px] mx-auto w-full">
        {/* Worship Info Card */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 space-y-4">
          <h3 className="font-semibold text-lg">예배 정보</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Picker */}
            <div className="space-y-2">
              <Label htmlFor="date">예배 날짜</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {date ? format(date, 'yyyy년 M월 d일 (EEE)', { locale: ko }) : "날짜 선택"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            {/* Time Picker */}
            <div className="space-y-2">
              <Label htmlFor="time">예배 시간</Label>
              <div className="flex gap-2">
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIODS.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={hour} onValueChange={setHour}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HOURS.map(h => (
                      <SelectItem key={h} value={h}>{h}시</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={minute} onValueChange={setMinute}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MINUTES.map(m => (
                      <SelectItem key={m} value={m}>{m}분</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">예배 제목 *</Label>
            <Input
              id="title"
              placeholder="예: 2026.01.25 주일예배"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-base"
            />
          </div>
          {/* Memo */}
          <div className="space-y-2">
            <Label htmlFor="memo">메모 / 지시사항</Label>
            <Textarea
              id="memo"
              placeholder="예배 진행에 필요한 특별 지시사항이나 메모를 입력하세요."
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>
        </div>

        {/* Song List */}
        <div className="space-y-4 pb-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4 text-neutral-500" />
              <h3 className="font-semibold text-neutral-900">곡 목록</h3>
              <span className="text-sm text-muted-foreground">({tempSongs.length}곡)</span>
            </div>
          </div>

          {/* Render Added Songs */}
          <div className="space-y-2">
              {tempSongs.map((song, index) => (
                <div key={song.tempId} className="rounded-xl border bg-white p-4">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded bg-neutral-200 flex items-center justify-center text-xs font-mono font-bold text-neutral-600">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                          <h4 className="font-bold text-base">{song.customTitle}</h4>
                          {song.isNewSong && (
                              <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded">NEW</span>
                          )}
                      </div>
                      <p className="text-xs text-neutral-500">
                        {song.keySignature || '-'} · {song.bpm || '-'} BPM
                        {song.artist && ` · ${song.artist}`}
                      </p>
                       {/* Parse SongForm from note if possible? */}
                       {/* Display rudimentary preview if note contains [SongForm] */}
                       {song.note && song.note.includes('[SongForm]') && (
                           <div className="mt-1 text-xs text-primary/70 font-mono">
                               Song Sequence defined
                           </div>
                       )}
                    </div>
                    {/* Add action buttons (Edit, Delete) */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-neutral-400 hover:text-destructive"
                      onClick={() => removeSong(song.tempId)}
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
          </div>

          {/* New Song Editing Card (Inline Draft) */}
          {isAddingNewSong && (
             <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
                 <SongDirectEditCard 
                    onSave={(data) => {
                      addNewSong(data)
                      setIsAddingNewSong(false)
                    }}
                    onCancel={() => setIsAddingNewSong(false)}
                 />
             </div>
          )}

          {/* Action Buttons */}
          {!isAddingNewSong && (
             <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-32 border-dashed bg-amber-50/30 border-amber-200/50 hover:bg-amber-50 hover:border-amber-300 group transition-all"
                  onClick={() => setIsAddingNewSong(true)}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                      <Plus className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="text-center text-wrap">
                      <p className="text-sm font-bold text-amber-900">새로운 찬양 등록</p>
                      <p className="text-[10px] text-amber-600/70 mt-0.5 font-medium">라이브러리에 없는 곡 추가</p>
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-32 border-dashed bg-indigo-50/30 border-indigo-200/50 hover:bg-indigo-50 hover:border-indigo-300 group transition-all"
                  onClick={() => {
                    setSearchTab('team')
                    setSearchOpen(true)
                  }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                      <Music className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="text-center text-wrap">
                      <p className="text-sm font-bold text-indigo-900">기존 찬양 불러오기</p>
                      <p className="text-[10px] text-indigo-600/70 mt-0.5 font-medium">팀 라이브러리에서 선택</p>
                    </div>
                  </div>
                </Button>
            </div>
          )}

          {/* Empty State when no songs and not adding */}
          {!isAddingNewSong && tempSongs.length === 0 && (
             <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed text-center bg-muted/5 mt-4">
               <p className="text-sm text-muted-foreground/60 italic font-medium">추가된 곡이 없습니다.</p>
               <p className="text-xs text-muted-foreground/40 mt-1">예배 순서에 맞춰 곡을 추가해보세요.</p>
             </div>
          )}

        </div>
      </div>

      {/* Song Search Dialog */}
      <SongSearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSelect={(song) => {
          addExistingSong(song)
          setSearchOpen(false)
        }}
        existingSongIds={tempSongs.map(s => s.teamSongId).filter(Boolean) as string[]}
        initialTab={searchTab}
      />
    </div>
  )
}
