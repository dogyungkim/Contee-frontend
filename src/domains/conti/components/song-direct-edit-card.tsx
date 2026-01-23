'use client'

import { useState } from 'react'
import { Save, X, Music, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SongFormDialog } from '@/domains/song/components/song-form-dialog'
import { getSongFormSummary } from '@/domains/song/utils/song-form'
import { SongFormPart, CreateTeamSongRequest } from '@/types/song'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface SongDirectEditCardProps {
  onSave: (data: CreateTeamSongRequest) => void
  onCancel: () => void
}

const KEYS = ['C', 'C#', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

export function SongDirectEditCard({ onSave, onCancel }: SongDirectEditCardProps) {
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [key, setKey] = useState('')
  const [bpm, setBpm] = useState('60')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [sheetMusicUrl, setSheetMusicUrl] = useState('')
  const [note, setNote] = useState('')
  const [songForm, setSongForm] = useState<SongFormPart[]>([])
  const [formDialogOpen, setFormDialogOpen] = useState(false)

  const handleSave = () => {
    if (!title.trim()) {
      alert('곡 제목을 입력해주세요.')
      return
    }

    // Serialize song form to JSON and store in 'note' field for now, 
    // appending to user note or handling as dedicated storage if note is empty
    // For MVP, lets structure note field as:
    // User Note...
    // ---
    // JSON: [...]
    
    let finalNote = note
    if (songForm.length > 0) {
        if (finalNote) finalNote += '\n\n'
        finalNote += `[SongForm]${JSON.stringify(songForm)}`
    }

    const request: CreateTeamSongRequest = {
      customTitle: title,
      artist: artist,
      keySignature: key,
      bpm: bpm ? parseInt(bpm) : undefined,
      youtubeUrl: youtubeUrl,
      sheetMusicUrl: sheetMusicUrl,
      note: finalNote,
    }
    onSave(request)
  }

  // Use shared summary logic
  const groupedFlow = getSongFormSummary(songForm)

  return (
    <Card className="border-2 border-primary/20 shadow-lg">
      <CardHeader className="bg-muted/5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
               <Music className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-lg">새로운 찬양 등록</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="title" className="text-primary font-semibold">곡 제목 *</Label>
                    <Input 
                        id="title" 
                        placeholder="곡 제목을 입력하세요" 
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="font-bold text-lg"
                        autoFocus
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="artist">아티스트</Label>
                    <Input 
                        id="artist" 
                        placeholder="예: 마커스워십, 제이어스" 
                        value={artist}
                        onChange={e => setArtist(e.target.value)}
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Key (조)</Label>
                    <Select value={key} onValueChange={setKey}>
                        <SelectTrigger>
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
                    <Label htmlFor="bpm">BPM (템포)</Label>
                    <Input 
                        id="bpm" 
                        type="number" 
                        min="0"
                        placeholder="예: 60" 
                        value={bpm}
                        onChange={e => setBpm(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="youtube">YouTube 링크</Label>
                    <Input 
                        id="youtube" 
                        placeholder="https://youtube.com/..." 
                        value={youtubeUrl}
                        onChange={e => setYoutubeUrl(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="sheetMusic">악보 링크</Label>
                    <Input 
                        id="sheetMusic" 
                        placeholder="악보 이미지 또는 PDF 링크" 
                        value={sheetMusicUrl}
                        onChange={e => setSheetMusicUrl(e.target.value)}
                    />
                </div>
            </div>
        </div>

        <Separator />

        {/* Song Form Editor */}
        <div className="space-y-2">
             <div className="flex items-center justify-between">
                <Label>곡 구성 (Song Form)</Label>
                <Button variant="outline" size="sm" onClick={() => setFormDialogOpen(true)} className="h-7 text-xs">
                    {songForm.length > 0 ? '편집하기' : '구성 설정하기'}
                </Button>
             </div>
             
             {songForm.length > 0 ? (
                 <div className="bg-slate-50 rounded-xl p-4 border flex items-center gap-2 overflow-x-auto">
                    {groupedFlow.map((group, index) => (
                        <div key={index} className="flex items-center gap-2 shrink-0">
                             <div className={cn("px-3 py-1.5 rounded-md text-sm font-bold border shadow-sm", {
                                 'bg-blue-50 border-blue-200 text-blue-700': group.type === 'Verse',
                                 'bg-purple-50 border-purple-200 text-purple-700': group.type === 'Chorus',
                                 'bg-slate-50 border-slate-200 text-slate-700': group.type === 'Intro' || group.type === 'Outro',
                                 'bg-amber-50 border-amber-200 text-amber-700': group.type === 'Bridge',
                                 'bg-emerald-50 border-emerald-200 text-emerald-700': group.type === 'Instrumental',
                                 'bg-rose-50 border-rose-200 text-rose-700': group.type === 'Tag',
                                 'bg-cyan-50 border-cyan-200 text-cyan-700': group.type === 'Interlude',
                             })}>
                                 {group.abbr}
                                 {group.showBars && <span className="ml-1 text-xs opacity-70 font-normal">({group.bars})</span>}
                                 {group.count > 1 && <span className="ml-1 text-[10px] bg-black/10 px-1 rounded opacity-70">x{group.count}</span>}
                             </div>
                             {index < groupedFlow.length - 1 && <span className="text-slate-300">→</span>}
                        </div>
                    ))}
                 </div>
             ) : (
                 <div 
                    className="bg-slate-50 border border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => setFormDialogOpen(true)}
                >
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
                        <Music className="h-4 w-4 text-slate-500" />
                    </div>
                    <p className="text-sm text-slate-500 font-medium">아직 설정된 곡 구성이 없습니다.</p>
                    <p className="text-xs text-slate-400">클릭하여 곡의 흐름(Verse, Chorus 등)을 구성해보세요.</p>
                 </div>
             )}

             <SongFormDialog 
                open={formDialogOpen} 
                onOpenChange={setFormDialogOpen}
                value={songForm}
                onChange={setSongForm}
             />
        </div>

        <Separator />

        {/* Notes */}
        <div className="space-y-2">
            <Label htmlFor="note">메모</Label>
            <Textarea 
                id="note" 
                placeholder="곡에 대한 메모를 입력하세요." 
                className="min-h-[80px]"
                value={note}
                onChange={e => setNote(e.target.value)}
            />
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onCancel} className="w-24">취소</Button>
            <Button onClick={handleSave} className="w-32 gap-2">
                <Save className="h-4 w-4" />
                저장
            </Button>
        </div>
      </CardContent>
    </Card>
  )
}
