'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clipboard, Link2, Plus, LayoutList, Share2, Info, Music, BookOpen, Loader2, ChevronDown, X } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

import {
  useContiDetail,
  useDisableExternalShare,
  useEnableExternalShare,
  useUpdateConti,
} from '../hooks/use-conti'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ContiSongList } from './conti-song-list'
import { SongSearchDialog } from './song-search-dialog'
import { TeamSong } from '@/types/song'
import { ContiSong, ContiSongRequestItem } from '@/types/conti'
import { useTeam } from '@/context/team-context'
import { useTeamMembersQuery } from '@/domains/team/hooks/use-team-query'
import { useAuth } from '@/domains/auth/hooks/use-auth'
import { toast } from '@/lib/toast'
import { getContiApiErrorMessage } from '@/domains/conti/utils/conti-error'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useUnsavedChangesGuard } from '@/hooks/use-unsaved-changes-guard'
import { Badge } from '@/components/ui/badge'

interface ContiDetailProps {
  contiId: string
}

export function ContiDetail({ contiId }: ContiDetailProps) {
  const { selectedTeamId } = useTeam()
  const { user } = useAuth()
  const { data: conti, isLoading: isContiLoading } = useContiDetail(contiId)
  const songs = conti?.contiSongs || []
  const permissionTeamId = conti?.teamId || selectedTeamId || ''
  const { data: teamMembers = [] } = useTeamMembersQuery(permissionTeamId)

  const { mutateAsync: updateContiMutateAsync } = useUpdateConti()
  const { mutateAsync: enableExternalShareAsync, isPending: isEnablingExternalShare } = useEnableExternalShare()
  const { mutateAsync: disableExternalShareAsync, isPending: isDisablingExternalShare } = useDisableExternalShare()

  const [searchOpen, setSearchOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftDate, setDraftDate] = useState<Date | undefined>(undefined)
  const [draftMemo, setDraftMemo] = useState('')
  const [draftBibleVerseReference, setDraftBibleVerseReference] = useState('')
  const [draftBibleVerseContent, setDraftBibleVerseContent] = useState('')
  const [draftSharingInfo, setDraftSharingInfo] = useState('')
  const [draftSongs, setDraftSongs] = useState<ContiSong[]>([])
  const [isSavingMeta, setIsSavingMeta] = useState(false)
  const [isWordSharingOpen, setIsWordSharingOpen] = useState(true)

  const currentMember = teamMembers.find((member) => member.userId === String(user?.id))
  const canEdit =
    currentMember?.role === 'OWNER' ||
    currentMember?.role === 'ADMIN' ||
    currentMember?.role === 'MEMBER'
  const canManageExternalShare =
    currentMember?.role === 'OWNER' ||
    currentMember?.role === 'ADMIN'
  const isEditable = canEdit && isEditMode

  useEffect(() => {
    if (!conti) return

    const verseLines = conti.bibleVerse
      ? conti.bibleVerse
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean)
      : []

    setDraftTitle(conti.title)
    setDraftDate(new Date(conti.worshipDate))
    setDraftMemo(conti.memo ?? '')
    setDraftBibleVerseReference(verseLines[0] ?? '')
    setDraftBibleVerseContent(verseLines.slice(1).join('\n'))
    setDraftSharingInfo(conti.sharingInfo ?? '')
    setDraftSongs(conti.contiSongs ?? [])
  }, [conti])

  const bibleVerseLines = conti?.bibleVerse
    ? conti.bibleVerse
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
    : []
  const bibleVerseReference = bibleVerseLines[0]
  const bibleVerseContent = bibleVerseLines.slice(1).join('\n')
  const normalizeSongs = (items: ContiSong[]) =>
    items.map((song, index) => ({
      id: song.id.startsWith('draft-song-') ? undefined : song.id,
      teamSongId: song.teamSongId,
      title: song.title,
      artist: song.artist,
      key: song.key,
      bpm: song.bpm,
      note: song.note,
      youtubeUrl: song.youtubeUrl,
      sheetMusicUrl: song.sheetMusicUrl,
      orderIndex: index,
      songForm: song.songForm,
    }))
  const hasMetaChanges =
    !!conti &&
    (draftTitle !== conti.title ||
      (draftDate ? format(draftDate, 'yyyy-MM-dd') : '') !== conti.worshipDate ||
      draftMemo !== (conti.memo ?? '') ||
      draftBibleVerseReference !== (bibleVerseReference ?? '') ||
      draftBibleVerseContent !== bibleVerseContent ||
      draftSharingInfo !== (conti.sharingInfo ?? ''))
  const hasSongChanges =
    !!conti &&
    JSON.stringify(normalizeSongs(draftSongs)) !== JSON.stringify(normalizeSongs(conti.contiSongs ?? []))
  const hasChanges = canEdit && (hasMetaChanges || hasSongChanges)
  const displayedSongs = isEditable ? draftSongs : songs

  useUnsavedChangesGuard({
    enabled: hasChanges && !isSavingMeta,
  })

  if (isContiLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
        <p className="text-sm font-medium">콘티 정보를 불러오는 중...</p>
      </div>
    )
  }

  if (!conti) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] border rounded-xl border-dashed bg-muted/5">
        <Info className="h-8 w-8 text-muted-foreground/30 mb-2" />
        <p className="text-sm font-medium text-muted-foreground">콘티를 찾을 수 없습니다.</p>
        <Button variant="link" asChild className="mt-2">
            <Link href="/dashboard/contis">목록으로 돌아가기</Link>
        </Button>
      </div>
    )
  }

  const handleSelectExisting = async (song: TeamSong) => {
    if (!isEditable) {
      toast.error('편집 권한이 없거나 보기 모드입니다.')
      return
    }

    const draftId = `draft-song-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setDraftSongs((prev) => [
      ...prev,
      {
        id: draftId,
        teamSongId: song.id,
        title: song.title,
        artist: song.artist,
        orderIndex: prev.length,
        key: song.keySignature,
        bpm: song.bpm,
        note: undefined,
        youtubeUrl: song.youtubeUrl,
        sheetMusicUrl: song.sheetMusicUrl,
        songForm: [],
        teamSong: song,
      },
    ])
  }

  const handleRemoveSong = async (songId: string) => {
    if (!isEditable) {
      toast.error('편집 권한이 없거나 보기 모드입니다.')
      return
    }

    setDraftSongs((prev) =>
      prev
        .filter((song) => song.id !== songId)
        .map((song, index) => ({ ...song, orderIndex: index }))
    )
  }

  const handleUpdateOrder = async (reorderedSongs: ContiSong[]) => {
    if (!isEditable) {
      toast.error('편집 권한이 없거나 보기 모드입니다.')
      return
    }

    setDraftSongs(reorderedSongs)
  }

  const handleOpenSearch = () => {
    if (!isEditable) {
      toast.error('편집 권한이 없거나 보기 모드입니다.')
      return
    }
    setSearchOpen(true)
  }

  const handleCancelMeta = () => {
    if (!conti) return

    const verseLines = conti.bibleVerse
      ? conti.bibleVerse
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean)
      : []

    setDraftTitle(conti.title)
    setDraftDate(new Date(conti.worshipDate))
    setDraftMemo(conti.memo ?? '')
    setDraftBibleVerseReference(verseLines[0] ?? '')
    setDraftBibleVerseContent(verseLines.slice(1).join('\n'))
    setDraftSharingInfo(conti.sharingInfo ?? '')
    setDraftSongs(conti.contiSongs ?? [])
    setIsEditMode(false)
  }

  const handleSaveMeta = async () => {
    if (!conti || !draftDate) return

    if (!draftTitle.trim()) {
      toast.error('콘티 제목을 입력해주세요.')
      return
    }

    const formattedBibleVerse = [draftBibleVerseReference.trim(), draftBibleVerseContent.trim()]
      .filter(Boolean)
      .join('\n')
    const contiSongsRequest: ContiSongRequestItem[] = draftSongs.map((song, index) => ({
      ...(song.id.startsWith('draft-song-') ? {} : { id: song.id }),
      ...(song.teamSongId ? { teamSongId: song.teamSongId } : { title: song.title }),
      artist: song.artist,
      youtubeUrl: song.youtubeUrl,
      sheetMusicUrl: song.sheetMusicUrl,
      orderIndex: index,
      key: song.key,
      bpm: song.bpm,
      note: song.note,
      songForm: song.songForm,
    }))

    setIsSavingMeta(true)
    try {
      await updateContiMutateAsync({
        contiId,
        request: {
          title: draftTitle.trim(),
          worshipDate: format(draftDate, 'yyyy-MM-dd'),
          memo: draftMemo.trim() || undefined,
          bibleVerse: formattedBibleVerse || undefined,
          sharingInfo: draftSharingInfo.trim() || undefined,
          contiSongs: contiSongsRequest,
        },
      })
      toast.success('콘티 정보를 저장했습니다.')
      setIsEditMode(false)
    } catch (error) {
      toast.error(getContiApiErrorMessage(error, '콘티 정보 저장에 실패했습니다.'))
    } finally {
      setIsSavingMeta(false)
    }
  }

  const handleStartEdit = () => {
    if (!conti) return

    const verseLines = conti.bibleVerse
      ? conti.bibleVerse
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean)
      : []

    setDraftTitle(conti.title)
    setDraftDate(new Date(conti.worshipDate))
    setDraftMemo(conti.memo ?? '')
    setDraftBibleVerseReference(verseLines[0] ?? '')
    setDraftBibleVerseContent(verseLines.slice(1).join('\n'))
    setDraftSharingInfo(conti.sharingInfo ?? '')
    setDraftSongs(conti.contiSongs ?? [])
    setIsEditMode(true)
  }

  const copyToClipboard = async (value: string, successMessage: string) => {
    if (typeof window === 'undefined') return

    try {
      await window.navigator.clipboard.writeText(value)
      toast.success(successMessage)
    } catch {
      toast.error('링크 복사에 실패했습니다.')
    }
  }

  const buildUrl = (path: string) => {
    if (typeof window === 'undefined') return path
    if (/^https?:\/\//.test(path)) return path
    return `${window.location.origin}${path}`
  }

  const handleCopyTeamShare = async () => {
    await copyToClipboard(buildUrl(`/dashboard/contis/${contiId}`), '팀 공유 링크를 복사했습니다.')
  }

  const handleEnableExternalShare = async () => {
    if (hasChanges) {
      toast.error('외부 공유 전에 변경사항을 먼저 저장해주세요.')
      return
    }

    if (!window.confirm('외부 공유를 켜면 링크를 가진 누구나 이 콘티를 볼 수 있습니다.')) return

    try {
      const externalShare = await enableExternalShareAsync(contiId)
      if (externalShare.url) {
        await copyToClipboard(buildUrl(externalShare.url), '외부 공유 링크를 만들고 복사했습니다.')
        return
      }
      toast.success('외부 공유를 켰습니다.')
    } catch (error) {
      toast.error(getContiApiErrorMessage(error, '외부 공유를 켜지 못했습니다.'))
    }
  }

  const handleCopyExternalShare = async () => {
    const shareUrl = conti.externalShare?.url
    if (!shareUrl) {
      toast.error('활성화된 외부 공유 링크가 없습니다.')
      return
    }

    await copyToClipboard(buildUrl(shareUrl), '외부 공유 링크를 복사했습니다.')
  }

  const handleDisableExternalShare = async () => {
    if (!window.confirm('외부 공유를 끄면 기존 링크로 더 이상 콘티를 볼 수 없습니다.')) return

    try {
      await disableExternalShareAsync(contiId)
      toast.success('외부 공유를 껐습니다.')
    } catch (error) {
      toast.error(getContiApiErrorMessage(error, '외부 공유를 끄지 못했습니다.'))
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header Section */}
      <div className="mx-auto w-full max-w-[1200px] rounded-xl border bg-background px-6 py-4 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <LayoutList className="h-3 w-3" />
              Service Continuity Editor
            </div>
            {isEditable ? (
              <>
                <Input
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  placeholder="콘티명을 입력하세요"
                  className="h-11 max-w-xl border-none bg-transparent px-0 text-xl font-bold tracking-tight shadow-none focus-visible:ring-0"
                />
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">예배일</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'h-8 justify-start text-left font-semibold text-primary/80',
                            !draftDate && 'text-muted-foreground'
                          )}
                        >
                          {draftDate ? format(draftDate, 'yyyy. MM. dd (EEE)', { locale: ko }) : '예배일 선택'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={draftDate}
                          onSelect={setDraftDate}
                          autoFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Separator orientation="vertical" className="hidden h-3 sm:block" />
                  <span className="flex items-center gap-1">
                    총 <span className="font-bold text-foreground">{displayedSongs.length}</span>곡
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight">{conti.title}</h2>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="font-semibold text-primary/80">
                    {format(new Date(conti.worshipDate), 'yyyy. MM. dd (EEE)', { locale: ko })}
                  </span>
                  <Separator orientation="vertical" className="h-3" />
                  <span className="flex items-center gap-1">
                    총 <span className="font-bold text-foreground">{displayedSongs.length}</span>곡
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">

            {isEditable && (
              <Button className="h-9 gap-2" onClick={handleOpenSearch}>
                <Plus className="h-4 w-4" />
                곡 추가
              </Button>
            )}
            {canEdit && !isEditMode && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9"
                  onClick={handleStartEdit}
                >
                  수정
                </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2">
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">공유</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => { void handleCopyTeamShare() }}>
                  <Clipboard className="mr-2 h-4 w-4" />
                  팀 공유 링크 복사
                </DropdownMenuItem>
                {canManageExternalShare && (
                  <>
                    <DropdownMenuSeparator />
                    {conti.externalShare?.enabled ? (
                      <>
                        <DropdownMenuItem onClick={() => { void handleCopyExternalShare() }}>
                          <Link2 className="mr-2 h-4 w-4" />
                          외부 공유 링크 복사
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          disabled={isDisablingExternalShare}
                          onClick={() => { void handleDisableExternalShare() }}
                        >
                          <X className="mr-2 h-4 w-4" />
                          외부 공유 끄기
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem
                        disabled={isEnablingExternalShare}
                        onClick={() => { void handleEnableExternalShare() }}
                      >
                        <Link2 className="mr-2 h-4 w-4" />
                        외부 공유 링크 만들기
                      </DropdownMenuItem>
                    )}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </div>
      </div>

      {/* Main Content: Full Width Song List */}
      <div className="mx-auto w-full max-w-[1200px] space-y-6">
        {(isEditable || conti.memo) && (
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <div>
              <p className="mb-2 text-xs font-bold text-amber-600">특이사항</p>
              {isEditable ? (
                <Textarea
                  value={draftMemo}
                  onChange={(e) => setDraftMemo(e.target.value)}
                  placeholder="예배 진행 관련 메모를 입력하세요."
                  className="min-h-[100px] resize-none"
                />
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-neutral-600">{conti.memo}</p>
              )}
            </div>
          </div>
        )}

        {(isEditable || conti.bibleVerse || conti.sharingInfo) && (
          <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-5">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-2 text-left"
              onClick={() => setIsWordSharingOpen((prev) => !prev)}
              aria-expanded={isWordSharingOpen}
              aria-controls="word-sharing-content"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-sky-200 bg-white">
                  <BookOpen className="h-4 w-4 text-sky-700" />
                </div>
                <h3 className="text-sm font-bold text-sky-900">말씀 & 나눔</h3>
              </div>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-sky-700 transition-transform duration-200',
                  isWordSharingOpen ? 'rotate-180' : 'rotate-0'
                )}
              />
            </button>
            {isWordSharingOpen && (
              <div id="word-sharing-content" className="mt-3 space-y-4">
                {(isEditable || conti.bibleVerse) && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-4">
                    <p className="mb-1 text-xs font-bold text-emerald-800">본문</p>
                    {isEditable ? (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="bible-verse-reference" className="text-emerald-900">본문 위치</Label>
                          <Input
                            id="bible-verse-reference"
                            value={draftBibleVerseReference}
                            onChange={(e) => setDraftBibleVerseReference(e.target.value)}
                            placeholder="예: 시편 23편"
                            className="border-emerald-200 bg-white/90 focus-visible:ring-emerald-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bible-verse-content" className="text-emerald-900">본문</Label>
                          <Textarea
                            id="bible-verse-content"
                            value={draftBibleVerseContent}
                            onChange={(e) => setDraftBibleVerseContent(e.target.value)}
                            placeholder="본문 내용을 입력하세요."
                            className="min-h-[120px] resize-none border-emerald-200 bg-white/90 focus-visible:ring-emerald-300"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        {bibleVerseReference && (
                          <p className="text-sm font-semibold text-emerald-900">{bibleVerseReference}</p>
                        )}
                        {bibleVerseContent && (
                          <p className="mt-1 text-sm text-emerald-950/80 leading-relaxed whitespace-pre-wrap">{bibleVerseContent}</p>
                        )}
                      </>
                    )}
                  </div>
                )}
                {(isEditable || conti.sharingInfo) && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-4">
                    <p className="mb-1 text-xs font-bold text-amber-800">나눔</p>
                    {isEditable ? (
                      <Textarea
                        value={draftSharingInfo}
                        onChange={(e) => setDraftSharingInfo(e.target.value)}
                        placeholder="팀 나눔 내용을 입력하세요."
                        className="min-h-[140px] resize-none border-amber-200 bg-white/90 focus-visible:ring-amber-300"
                      />
                    ) : (
                      <p className="text-sm text-amber-950/80 leading-relaxed whitespace-pre-wrap">{conti.sharingInfo}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className={cn('space-y-4', isEditMode ? 'pb-32' : 'pb-20')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4 text-neutral-500" />
              <h3 className="font-semibold text-neutral-900">곡 목록</h3>
            </div>
          </div>

          <ContiSongList
            songs={displayedSongs}
            isEditMode={isEditable}
            onRemove={(songId) => {
              void handleRemoveSong(songId)
            }}
            onUpdateOrder={handleUpdateOrder}
            onChangeSong={(song) => {
              setDraftSongs((prev) => prev.map((item) => (item.id === song.id ? song : item)))
            }}
          />

          {isEditable && (
            <Button
              variant="outline"
              className="w-full border-dashed py-10 bg-muted/5 hover:bg-muted/10 group transition-all"
              onClick={handleOpenSearch}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 rounded-full border border-dashed flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-xs text-muted-foreground font-medium">새로운 찬양 추가하기</span>
              </div>
            </Button>
          )}
        </div>
      </div>

      <SongSearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSelect={(song) => {
          void handleSelectExisting(song)
          setSearchOpen(false)
        }}
        existingSongIds={draftSongs.map((song) => song.teamSongId).filter(Boolean) as string[]}
      />

      {canEdit && isEditMode && (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 px-4">
          <div className="pointer-events-auto mx-auto flex w-full max-w-[1200px] flex-col gap-3 rounded-2xl border bg-background/95 px-4 py-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
                  수정 중
                </Badge>
                {hasChanges && (
                  <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">
                    변경사항 있음
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                저장 전에는 변경사항이 반영되지 않습니다.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="flex-1 sm:flex-none"
                onClick={handleCancelMeta}
                disabled={isSavingMeta}
              >
                취소
              </Button>
              <Button
                className="flex-1 sm:flex-none"
                onClick={() => {
                  void handleSaveMeta()
                }}
                disabled={isSavingMeta || !hasChanges}
              >
                {isSavingMeta ? '저장 중...' : '저장 후 닫기'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
