'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  Plus,
  Music,
  ChevronLeft,
  BookOpen,
  X,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useTeam } from '@/context/team-context'
import { useAuth } from '@/domains/auth/hooks/use-auth'
import { useNewContiForm } from '@/domains/conti/hooks/use-new-conti-form'
import { useTeamMembersQuery } from '@/domains/team/hooks/use-team-query'
import { canCreateConti } from '@/domains/team/utils/team-permissions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SongSearchDialog } from '@/domains/conti/components/song-search-dialog'
import { SongDirectEditCard } from '@/domains/conti/components/song-direct-edit-card'
import { mapRequestSongFormToUi } from '@/domains/song/utils/song-form'
import { PERIODS, HOURS, MINUTES } from '@/domains/conti/utils/worship-time'
import { ContiEditorActionBar } from '@/domains/conti/components/conti-editor-action-bar'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useUnsavedChangesGuard } from '@/hooks/use-unsaved-changes-guard'

export default function NewContiPage() {
  const router = useRouter()
  const { selectedTeamId, selectedTeam, isLoading: isTeamLoading } = useTeam()
  const { user } = useAuth()
  const { data: teamMembers = [], isLoading: isMembersLoading } =
    useTeamMembersQuery(selectedTeamId || '')

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
    bibleVerseReference,
    setBibleVerseReference,
    bibleVerseContent,
    setBibleVerseContent,
    sharingInfo,
    setSharingInfo,
    tempSongs,
    addExistingSong,
    addNewSong,
    updateSong,
    updateSheetMusicFile,
    moveSong,
    removeSong,
    handleSave,
    isSaving,
    savingIntent,
  } = useNewContiForm(selectedTeamId)

  // UI State (kept in component as it's purely UI-related)
  const [searchOpen, setSearchOpen] = useState(false)
  const hasChanges =
    !!title.trim() ||
    !!memo.trim() ||
    !!bibleVerseReference.trim() ||
    !!bibleVerseContent.trim() ||
    !!sharingInfo.trim() ||
    tempSongs.length > 0
  const currentMember = teamMembers.find(
    (member) => String(member.userId) === String(user?.id)
  )
  const canCreate = canCreateConti(currentMember?.role)

  useUnsavedChangesGuard({
    enabled: hasChanges && !isSaving,
  })

  const handleCancel = () => {
    if (
      hasChanges &&
      !window.confirm(
        '저장하지 않은 콘티 작성 내용이 있습니다. 페이지를 떠나시겠습니까?'
      )
    ) {
      return
    }
    router.push('/dashboard/contis')
  }

  if (isTeamLoading || isMembersLoading) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center space-y-3 rounded-lg border border-dashed text-center">
        <p className="type-body-sm text-muted-foreground">
          팀 정보를 불러오는 중...
        </p>
      </div>
    )
  }

  if (!selectedTeamId || !selectedTeam) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center space-y-4 rounded-lg border border-dashed text-center">
        <p className="text-muted-foreground">선택된 팀이 없습니다.</p>
        <p className="type-body-sm text-muted-foreground">
          먼저 팀을 선택하거나 생성해주세요.
        </p>
      </div>
    )
  }

  if (!canCreate) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center space-y-4 rounded-lg border border-dashed px-4 text-center">
        <p className="text-foreground">콘티를 만들 권한이 없습니다.</p>
        <p className="type-body-sm text-muted-foreground">
          팀 관리자에게 권한을 요청하거나 콘티 목록으로 돌아가세요.
        </p>
        <Button asChild variant="outline">
          <Link href="/dashboard/contis">콘티 목록으로 돌아가기</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header Section */}
      <div className="top-0 z-20 rounded-lg border border-b bg-background px-4 py-4 backdrop-blur sm:px-5">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                <Link href="/dashboard/contis">
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h2 className="type-section-title">새 콘티 만들기</h2>
            </div>
            <p className="type-page-description ml-10">
              {selectedTeam.name} 팀의 예배 콘티를 작성합니다.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto w-full max-w-[1200px] space-y-6">
        {/* Worship Info Card */}
        <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
          <h3 className="type-card-title">예배 정보</h3>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Date Picker */}
            <div className="space-y-2">
              <Label htmlFor="new-conti-date">예배 날짜</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="new-conti-date"
                    aria-label="예배 날짜 선택"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {date
                      ? format(date, 'yyyy년 M월 d일 (EEE)', { locale: ko })
                      : '날짜 선택'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[calc(100vw-2rem)] overflow-x-auto p-0 sm:w-auto"
                  align="start"
                >
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
            <fieldset className="space-y-2">
              <legend className="type-label">예배 시간</legend>
              <div className="grid grid-cols-[88px_minmax(0,1fr)_minmax(0,1fr)] gap-2">
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-full" aria-label="오전 또는 오후">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIODS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={hour} onValueChange={setHour}>
                  <SelectTrigger className="flex-1" aria-label="예배 시간 시">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HOURS.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}시
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={minute} onValueChange={setMinute}>
                  <SelectTrigger className="flex-1" aria-label="예배 시간 분">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MINUTES.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}분
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </fieldset>
          </div>
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">예배 제목 *</Label>
            <Input
              id="title"
              placeholder="예: 2026.01.25 주일예배"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="type-body"
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

        {/* Bible Verse & Sharing Section */}
        <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50">
                <BookOpen className="h-4 w-4 text-neutral-600" />
              </div>
              <h3 className="type-card-title text-neutral-900">말씀 & 나눔</h3>
            </div>
          </div>
          <div className="space-y-3 rounded-lg border border-neutral-200 bg-neutral-50/40 p-3 sm:p-4">
            <div className="space-y-2">
              <Label htmlFor="bibleVerseReference">본문 위치</Label>
              <Input
                id="bibleVerseReference"
                placeholder="예: 요한복음 : 3 : 16"
                value={bibleVerseReference}
                onChange={(e) => setBibleVerseReference(e.target.value)}
                className="type-body bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bibleVerseContent">본문</Label>
              <Textarea
                id="bibleVerseContent"
                placeholder="예: 하나님이 세상을 이처럼 사랑하사..."
                value={bibleVerseContent}
                onChange={(e) => setBibleVerseContent(e.target.value)}
                className="min-h-[120px] resize-none bg-white"
              />
            </div>
          </div>
          <div className="space-y-3 rounded-lg border border-neutral-200 bg-neutral-50/40 p-3 sm:p-4">
            <div className="space-y-2">
              <Label htmlFor="sharingInfo">나눔</Label>
              <Textarea
                id="sharingInfo"
                placeholder="오늘 콘티 나눔 내용을 입력하세요."
                value={sharingInfo}
                onChange={(e) => setSharingInfo(e.target.value)}
                className="min-h-[140px] resize-none bg-white"
              />
            </div>
          </div>
        </div>

        {/* Song List */}
        <div className="space-y-4 pb-32">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4 text-neutral-500" />
              <h3 className="font-semibold text-neutral-900">곡 목록</h3>
              <span className="type-body-sm text-muted-foreground">
                ({tempSongs.length}곡)
              </span>
            </div>
          </div>

          {/* Render Added Songs */}
          <div className="space-y-2">
            {tempSongs.map((song, index) => (
              <div
                key={song.tempId}
                className="rounded-xl border border-neutral-200 bg-white p-3 sm:p-4"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="type-label flex h-7 w-7 items-center justify-center rounded-md bg-neutral-100 text-neutral-600">
                      {index + 1}
                    </span>
                    <span className="type-body-sm font-semibold text-neutral-900">
                      {song.isNewSong ? '새 찬양' : '기존 찬양'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-neutral-500"
                      onClick={() => moveSong(song.tempId, 'up')}
                      disabled={index === 0}
                      aria-label={`${song.customTitle} 위로 이동`}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-neutral-500"
                      onClick={() => moveSong(song.tempId, 'down')}
                      disabled={index === tempSongs.length - 1}
                      aria-label={`${song.customTitle} 아래로 이동`}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-neutral-400 transition-colors hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => removeSong(song.tempId)}
                      aria-label={`${song.customTitle} 삭제`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <SongDirectEditCard
                  variant="embedded"
                  title={song.isNewSong ? '' : '콘티 곡 정보'}
                  submitLabel="변경 적용"
                  idPrefix={`new-conti-song-${song.tempId}`}
                  identityLocked={!song.isNewSong}
                  showResourceFields={song.isNewSong}
                  showSheetMusicUpload
                  sheetMusicFile={song.sheetMusicFile}
                  onSheetMusicFileChange={(file) =>
                    updateSheetMusicFile(song.tempId, file)
                  }
                  noteLabel={song.isNewSong ? '팀 곡 메모' : '콘티 메모'}
                  notePlaceholder={
                    song.isNewSong
                      ? '곡 라이브러리에 저장할 메모를 입력하세요.'
                      : '이 콘티에서만 사용할 메모를 입력하세요.'
                  }
                  showCancelButton={false}
                  showFooterActions={false}
                  initialValue={{
                    title: song.customTitle,
                    artist: song.artist,
                    keySignature: song.keySignature,
                    bpm: song.bpm,
                    youtubeUrl: song.youtubeUrl || song.teamSong?.youtubeUrl,
                    sheetMusicUrl:
                      song.sheetMusicUrl || song.teamSong?.sheetMusicUrl,
                    note: song.isNewSong ? song.note : song.contiNote || '',
                  }}
                  initialSongForm={mapRequestSongFormToUi(song.songForm)}
                  onChange={(data) => updateSong(song.tempId, data)}
                  onSave={() => undefined}
                  onCancel={() => removeSong(song.tempId)}
                />
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <Button
              variant="outline"
              className="h-32 border-dashed bg-white hover:bg-neutral-50 group transition-all"
              onClick={addNewSong}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 rounded-md border bg-neutral-50 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Plus className="h-5 w-5 text-neutral-700" />
                </div>
                <div className="text-center text-wrap">
                  <p className="type-body-sm font-bold text-neutral-900">
                    새로운 찬양 등록
                  </p>
                  <p className="type-badge mt-0.5 text-muted-foreground">
                    라이브러리에 없는 곡 추가
                  </p>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-32 border-dashed bg-white hover:bg-neutral-50 group transition-all"
              onClick={() => {
                setSearchOpen(true)
              }}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 rounded-md border bg-neutral-50 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Music className="h-5 w-5 text-neutral-700" />
                </div>
                <div className="text-center text-wrap">
                  <p className="type-body-sm font-bold text-neutral-900">
                    기존 찬양 불러오기
                  </p>
                  <p className="type-badge mt-0.5 text-muted-foreground">
                    팀 라이브러리에서 선택
                  </p>
                </div>
              </div>
            </Button>
          </div>

          {/* Empty State when no songs and not adding */}
          {tempSongs.length === 0 && (
            <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed text-center bg-muted/5 mt-4">
              <p className="type-body-sm text-muted-foreground/60 italic font-medium">
                추가된 곡이 없습니다.
              </p>
              <p className="type-body-sm mt-1 text-muted-foreground/40">
                예배 순서에 맞춰 곡을 추가해보세요.
              </p>
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
        existingSongIds={
          tempSongs.map((s) => s.teamSongId).filter(Boolean) as string[]
        }
      />

      <ContiEditorActionBar
        isDraft
        hasChanges={hasChanges}
        isSaving={isSaving}
        badgeLabel="작성 중"
        description="임시 저장한 콘티는 팀에 공개하기 전까지 작성자에게만 보입니다."
        saveLabel={
          savingIntent === 'publish' ? '공개 중...' : '저장하고 팀에 공개'
        }
        savingLabel={savingIntent === 'draft' ? '저장 중...' : '공개 중...'}
        saveDisabled={!title.trim()}
        onCancel={handleCancel}
        onSave={() => {
          void handleSave('publish')
        }}
        secondaryAction={{
          label: savingIntent === 'draft' ? '저장 중...' : '임시 저장',
          disabled: !title.trim(),
          onClick: () => {
            void handleSave('draft')
          },
        }}
      />
    </div>
  )
}
