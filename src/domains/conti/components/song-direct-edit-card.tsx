'use client'

import { useId, useRef, useState } from 'react'
import { FileText, Music, Save, Trash2, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SongFormDialog } from '@/domains/song/components/song-form-dialog'
import { getSongFormSummary } from '@/domains/song/utils/song-form'
import { SongFormPart, CreateTeamSongRequest, SongPartType, SongFormPartRequest } from '@/types/song'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { toast } from '@/lib/toast'
import type { SheetMusicFile } from '@/types/conti'
import { openSheetMusic } from '@/domains/conti/utils/sheet-music'

interface SongDirectEditCardProps {
  onSave: (data: CreateTeamSongRequest, sheetMusicFile?: File) => void
  onCancel: () => void
  onChange?: (data: CreateTeamSongRequest) => void
  initialValue?: Partial<CreateTeamSongRequest>
  initialSongForm?: SongFormPart[]
  title?: string
  submitLabel?: string
  variant?: 'card' | 'embedded'
  idPrefix?: string
  identityLocked?: boolean
  showResourceFields?: boolean
  noteLabel?: string
  notePlaceholder?: string
  showCancelButton?: boolean
  showFooterActions?: boolean
  isSubmitting?: boolean
  showSheetMusicUpload?: boolean
  sheetMusicFile?: File | null
  existingSheetMusicFile?: SheetMusicFile | null
  isSheetMusicMarkedForDeletion?: boolean
  onSheetMusicFileChange?: (file: File | null) => void
  onSheetMusicDeleteRequest?: () => void
}

const KEYS = ['C', 'C#', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
const SONG_PART_TYPE_MAP: Record<SongFormPart['type'], SongPartType> = {
  Intro: 'INTRO',
  Verse: 'VERSE',
  'Pre-chorus': 'PRE_CHORUS',
  Chorus: 'CHORUS',
  Bridge: 'BRIDGE',
  Interlude: 'INTERLUDE',
  Outro: 'OUTRO',
  Tag: 'TAG',
  Instrumental: 'INSTRUMENTAL',
}
const BAR_COUNT_ENABLED_PART_TYPES: SongFormPart['type'][] = ['Intro', 'Interlude', 'Instrumental', 'Outro']
const MAX_PDF_SHEET_MUSIC_SIZE = 20 * 1024 * 1024
const MAX_IMAGE_SHEET_MUSIC_SIZE = 5 * 1024 * 1024
const SHEET_MUSIC_ACCEPT = 'application/pdf,image/png,image/jpeg,.pdf,.png,.jpg,.jpeg'
const SHEET_MUSIC_MIME_TYPES = new Set(['application/pdf', 'image/png', 'image/jpeg'])
const SHEET_MUSIC_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg']
const SHEET_MUSIC_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg']

const mapSongFormToRequest = (songForm: SongFormPart[]): SongFormPartRequest[] => {
  return songForm.map((part) => {
    const shouldIncludeBars = BAR_COUNT_ENABLED_PART_TYPES.includes(part.type)

    return {
      partType: SONG_PART_TYPE_MAP[part.type] || 'VERSE',
      customPartName: part.abbr,
      repeatCount: 1,
      barCount: shouldIncludeBars ? part.bars : undefined,
      note: part.label,
    }
  })
}

export function SongDirectEditCard({
  onSave,
  onCancel,
  onChange,
  initialValue,
  initialSongForm = [],
  title: headerTitle,
  submitLabel = '저장',
  variant = 'card',
  idPrefix,
  identityLocked = false,
  showResourceFields = true,
  noteLabel = '메모',
  notePlaceholder = '곡에 대한 메모를 입력하세요.',
  showCancelButton = true,
  showFooterActions = true,
  isSubmitting = false,
  showSheetMusicUpload = false,
  sheetMusicFile: controlledSheetMusicFile,
  existingSheetMusicFile,
  isSheetMusicMarkedForDeletion = false,
  onSheetMusicFileChange,
  onSheetMusicDeleteRequest,
}: SongDirectEditCardProps) {
  const generatedId = useId()
  const fieldId = idPrefix ?? generatedId
  const [songTitle, setSongTitle] = useState(initialValue?.title ?? '')
  const [artist, setArtist] = useState(initialValue?.artist ?? '')
  const [key, setKey] = useState(initialValue?.keySignature ?? '')
  const [bpm, setBpm] = useState(initialValue?.bpm ? String(initialValue.bpm) : '60')
  const [youtubeUrl, setYoutubeUrl] = useState(initialValue?.youtubeUrl ?? '')
  const [sheetMusicUrl, setSheetMusicUrl] = useState(initialValue?.sheetMusicUrl ?? '')
  const [note, setNote] = useState(initialValue?.note ?? '')
  const [songForm, setSongForm] = useState<SongFormPart[]>(initialSongForm)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [localSheetMusicFile, setLocalSheetMusicFile] = useState<File | null>(null)
  const sheetMusicInputRef = useRef<HTMLInputElement>(null)
  const selectedSheetMusicFile =
    controlledSheetMusicFile === undefined ? localSheetMusicFile : controlledSheetMusicFile
  const displayTitle = headerTitle ?? '새로운 찬양 등록'
  const shouldShowEmbeddedTitle = variant === 'embedded' && headerTitle !== ''

  const buildRequest = (nextValue: Partial<{
    title: string
    artist: string
    key: string
    bpm: string
    youtubeUrl: string
    sheetMusicUrl: string
    note: string
    songForm: SongFormPart[]
  }> = {}): CreateTeamSongRequest => {
    const nextSongForm = nextValue.songForm ?? songForm
    const songFormRequest = mapSongFormToRequest(nextSongForm)

    return {
      title: nextValue.title ?? songTitle,
      artist: nextValue.artist ?? artist,
      keySignature: nextValue.key ?? key,
      bpm: (nextValue.bpm ?? bpm) ? Number.parseInt(nextValue.bpm ?? bpm) : undefined,
      youtubeUrl: nextValue.youtubeUrl ?? youtubeUrl,
      sheetMusicUrl: nextValue.sheetMusicUrl ?? sheetMusicUrl,
      note: nextValue.note ?? note,
      songForm: songFormRequest.length > 0 ? songFormRequest : undefined,
    }
  }

  const emitChange = (nextValue: Parameters<typeof buildRequest>[0]) => {
    onChange?.(buildRequest(nextValue))
  }

  const handleSave = () => {
    if (!songTitle.trim()) {
      toast.error('곡 제목을 입력해주세요.')
      return
    }

    const request = buildRequest()
    onSave(request, selectedSheetMusicFile ?? undefined)
  }

  const handleSheetMusicFile = (file: File | undefined) => {
    if (!file) return

    const normalizedFileName = file.name.toLowerCase()
    const isSupportedSheetMusic =
      SHEET_MUSIC_MIME_TYPES.has(file.type.toLowerCase()) ||
      SHEET_MUSIC_EXTENSIONS.some((extension) => normalizedFileName.endsWith(extension))

    if (!isSupportedSheetMusic) {
      toast.error('악보는 PDF, PNG, JPG, JPEG 파일만 업로드할 수 있습니다.')
      return
    }

    const isImage =
      file.type.toLowerCase().startsWith('image/') ||
      SHEET_MUSIC_IMAGE_EXTENSIONS.some((extension) => normalizedFileName.endsWith(extension))
    const maxFileSize = isImage ? MAX_IMAGE_SHEET_MUSIC_SIZE : MAX_PDF_SHEET_MUSIC_SIZE

    if (file.size > maxFileSize) {
      toast.error(
        isImage
          ? '이미지 악보는 5MB 이하만 업로드할 수 있습니다.'
          : 'PDF 악보는 20MB 이하만 업로드할 수 있습니다.',
      )
      return
    }

    setLocalSheetMusicFile(file)
    onSheetMusicFileChange?.(file)
  }

  const clearSelectedSheetMusicFile = () => {
    setLocalSheetMusicFile(null)
    onSheetMusicFileChange?.(null)
  }

  const openSheetMusicFilePicker = () => {
    sheetMusicInputRef.current?.click()
  }

  // Use shared summary logic
  const groupedFlow = getSongFormSummary(songForm)

  const content = (
    <>
      {variant === 'card' && (
        <CardHeader className="bg-muted/5 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Music className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="type-card-title min-w-0 break-words">{displayTitle}</CardTitle>
            </div>
            <Button variant="ghost" size="icon" className="shrink-0" onClick={onCancel} disabled={isSubmitting}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      )}
      <CardContent className={cn('space-y-5 sm:space-y-6', variant === 'card' ? 'px-4 pt-5 sm:px-6 sm:pt-6' : 'p-0')}>
        {shouldShowEmbeddedTitle && (
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Music className="h-4 w-4 text-primary" />
              </div>
              <h4 className="type-card-title min-w-0 break-words">{displayTitle}</h4>
            </div>
          </div>
        )}
        {/* Basic Info */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`${fieldId}-title`} className="text-primary font-semibold">곡 제목 *</Label>
              <Input
                id={`${fieldId}-title`}
                placeholder="곡 제목을 입력하세요"
                value={songTitle}
                onChange={e => {
                  setSongTitle(e.target.value)
                  emitChange({ title: e.target.value })
                }}
                className="type-emphasis"
                readOnly={identityLocked}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${fieldId}-artist`}>아티스트</Label>
              <Input
                id={`${fieldId}-artist`}
                placeholder="예: 마커스워십, 제이어스"
                value={artist}
                onChange={e => {
                  setArtist(e.target.value)
                  emitChange({ artist: e.target.value })
                }}
                readOnly={identityLocked}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label>Key (조)</Label>
              <Select
                value={key}
                onValueChange={(value) => {
                  setKey(value)
                  emitChange({ key: value })
                }}
              >
                <SelectTrigger aria-label="Key 선택">
                  <SelectValue placeholder="Key 선택" />
                </SelectTrigger>
                <SelectContent>
                  {KEYS.map(k => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${fieldId}-bpm`}>BPM (템포)</Label>
              <Input
                id={`${fieldId}-bpm`}
                type="number"
                min="0"
                placeholder="예: 60"
                value={bpm}
                onChange={e => {
                  setBpm(e.target.value)
                  emitChange({ bpm: e.target.value })
                }}
              />
            </div>
            {showResourceFields && (
              <>
                <div className="col-span-2 space-y-2 sm:col-span-1">
                  <Label htmlFor={`${fieldId}-youtube`}>YouTube 링크</Label>
                  <Input
                    id={`${fieldId}-youtube`}
                    placeholder="https://youtube.com/..."
                    value={youtubeUrl}
                    onChange={e => {
                      setYoutubeUrl(e.target.value)
                      emitChange({ youtubeUrl: e.target.value })
                    }}
                  />
                </div>
                {!showSheetMusicUpload && (
                  <div className="col-span-2 space-y-2 sm:col-span-1">
                    <Label htmlFor={`${fieldId}-sheetMusic`}>악보 링크</Label>
                    <Input
                      id={`${fieldId}-sheetMusic`}
                      placeholder="악보 이미지 또는 PDF 링크"
                      value={sheetMusicUrl}
                      onChange={e => {
                        setSheetMusicUrl(e.target.value)
                        emitChange({ sheetMusicUrl: e.target.value })
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {showSheetMusicUpload && (
          <div className="space-y-2">
            <Label>악보 파일</Label>
            <div className="rounded-lg border border-dashed p-3 sm:p-4">
              {selectedSheetMusicFile ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-2">
                    <FileText className="h-4 w-4 shrink-0 text-red-500" />
                    <span className="type-body-sm truncate font-medium">{selectedSheetMusicFile.name}</span>
                    <span className="type-badge shrink-0 text-muted-foreground">
                      {(selectedSheetMusicFile.size / 1024 / 1024).toFixed(1)}MB
                    </span>
                  </div>
                  <Button type="button" variant="ghost" size="sm" className="w-full sm:w-auto" onClick={clearSelectedSheetMusicFile}>
                    선택 취소
                  </Button>
                </div>
              ) : existingSheetMusicFile && !isSheetMusicMarkedForDeletion ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-2">
                    <FileText className="h-4 w-4 shrink-0 text-red-500" />
                    <span className="type-body-sm truncate font-medium">{existingSheetMusicFile.fileName}</span>
                  </div>
                  <div className="grid shrink-0 grid-cols-[1fr_auto] gap-1 sm:flex sm:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => {
                        void openSheetMusic(existingSheetMusicFile.downloadUrl).catch(() => {
                          toast.error('악보를 불러오지 못했습니다.')
                        })
                      }}
                    >
                      보기
                    </Button>
                    {onSheetMusicDeleteRequest && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={onSheetMusicDeleteRequest}
                        aria-label="업로드된 악보 삭제"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-3 text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto flex-col gap-2 px-4 py-3"
                    onClick={openSheetMusicFilePicker}
                  >
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="type-body-sm font-medium">
                      {isSheetMusicMarkedForDeletion
                        ? '새 악보 파일을 선택하거나 삭제 상태로 저장하세요'
                        : '악보 파일 선택'}
                    </span>
                    <span className="type-body-sm text-muted-foreground">
                      PDF 최대 20MB · PNG/JPG/JPEG 최대 5MB
                    </span>
                  </Button>
                  {isSheetMusicMarkedForDeletion && onSheetMusicDeleteRequest && (
                    <Button type="button" variant="ghost" size="sm" onClick={onSheetMusicDeleteRequest}>
                      삭제 취소
                    </Button>
                  )}
                </div>
              )}
              <input
                ref={sheetMusicInputRef}
                id={`${fieldId}-sheetMusicFile`}
                type="file"
                accept={SHEET_MUSIC_ACCEPT}
                hidden
                onChange={(event) => {
                  handleSheetMusicFile(event.target.files?.[0])
                  event.target.value = ''
                }}
              />
              {(selectedSheetMusicFile || (existingSheetMusicFile && !isSheetMusicMarkedForDeletion)) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mx-auto mt-3 flex text-primary"
                  onClick={openSheetMusicFilePicker}
                >
                  <Upload className="h-3.5 w-3.5" />
                  다른 악보 파일 선택
                </Button>
              )}
            </div>
          </div>
        )}

        <Separator />

        {/* Song Form Editor */}
        <div className="space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Label>곡 구성 (Song Form)</Label>
            <Button variant="outline" size="sm" onClick={() => setFormDialogOpen(true)} className="h-8 w-full sm:h-7 sm:w-auto">
              {songForm.length > 0 ? '편집하기' : '구성 설정하기'}
            </Button>
          </div>

          {songForm.length > 0 ? (
            <div className="flex items-center gap-2 overflow-x-auto rounded-xl border bg-slate-50 p-3 sm:p-4">
              {groupedFlow.map((group, index) => (
                <div key={index} className="flex items-center gap-2 shrink-0">
                  <div className={cn("type-badge px-3 py-1.5 rounded-md border shadow-sm", {
                    'bg-blue-50 border-blue-200 text-blue-700': group.type === 'Verse',
                    'bg-purple-50 border-purple-200 text-purple-700': group.type === 'Chorus',
                    'bg-slate-50 border-slate-200 text-slate-700': group.type === 'Intro' || group.type === 'Outro',
                    'bg-amber-50 border-amber-200 text-amber-700': group.type === 'Bridge',
                    'bg-emerald-50 border-emerald-200 text-emerald-700': group.type === 'Instrumental',
                    'bg-rose-50 border-rose-200 text-rose-700': group.type === 'Tag',
                    'bg-cyan-50 border-cyan-200 text-cyan-700': group.type === 'Interlude',
                  })}>
                    {group.abbr}
                    {group.showBars && <span className="type-badge ml-1 opacity-70 font-normal">({group.bars})</span>}
                    {group.count > 1 && <span className="type-badge ml-1 bg-black/10 px-1 rounded opacity-70">x{group.count}</span>}
                  </div>
                  {index < groupedFlow.length - 1 && <span className="text-slate-300">→</span>}
                </div>
              ))}
            </div>
          ) : (
            <div
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-slate-50 p-5 text-center transition-colors hover:bg-slate-100 sm:p-8"
              onClick={() => setFormDialogOpen(true)}
            >
              <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
                <Music className="h-4 w-4 text-slate-500" />
              </div>
              <p className="type-body-sm text-slate-500 font-medium">아직 설정된 곡 구성이 없습니다.</p>
              <p className="type-body-sm text-slate-400">클릭하여 곡의 흐름(Verse, Chorus 등)을 구성해보세요.</p>
            </div>
          )}

          <SongFormDialog
            open={formDialogOpen}
            onOpenChange={setFormDialogOpen}
            value={songForm}
            onChange={(value) => {
              setSongForm(value)
              emitChange({ songForm: value })
            }}
          />
        </div>

        <Separator />

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor={`${fieldId}-note`}>{noteLabel}</Label>
          <Textarea
            id={`${fieldId}-note`}
            placeholder={notePlaceholder}
            className="min-h-[80px]"
            value={note}
            onChange={e => {
              setNote(e.target.value)
              emitChange({ note: e.target.value })
            }}
          />
        </div>

        {/* Footer Actions */}
        {showFooterActions && <div className="grid grid-cols-2 gap-2 pt-2 sm:flex sm:justify-end">
          {showCancelButton && <Button variant="outline" onClick={onCancel} className="w-full sm:w-24" disabled={isSubmitting}>취소</Button>}
          <Button onClick={handleSave} className="w-full gap-2 sm:w-32" disabled={isSubmitting}>
            <Save className="h-4 w-4" />
            {submitLabel}
          </Button>
        </div>}
      </CardContent>
    </>
  )

  if (variant === 'embedded') {
    return <div className="space-y-6">{content}</div>
  }

  return (
    <Card className="border-2 border-primary/20 shadow-lg">
      {content}
    </Card>
  )
}
