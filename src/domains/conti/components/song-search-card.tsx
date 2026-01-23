'use client'
import { Music, Youtube, FileText, Star, Check } from 'lucide-react'
import { TeamSong } from '@/types/song'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
interface SongSearchCardProps {
  song: TeamSong
  isDisabled?: boolean  // 이미 추가된 곡
  onSelect: () => void
}
export function SongSearchCard({ song, isDisabled, onSelect }: SongSearchCardProps) {
  return (
    <div
      className={cn(
        "group relative rounded-lg border bg-white p-4 transition-all hover:border-primary/50",
        isDisabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* 1줄: 곡 제목 */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="font-bold text-base leading-tight flex-1">
          {song.customTitle}
          {song.isFavorite && (
            <Star className="inline-block ml-2 h-4 w-4 text-yellow-600 fill-current" />
          )}
        </h4>
        {isDisabled ? (
          <Badge variant="secondary" className="shrink-0">
            <Check className="h-3 w-3 mr-1" />
            추가됨
          </Badge>
        ) : (
          <Button
            size="sm"
            className="shrink-0 h-8"
            onClick={onSelect}
          >
            선택
          </Button>
        )}
      </div>
      {/* 2줄: 아티스트 · 키 · BPM · CCLI */}
      <div className="flex items-center gap-2 text-xs text-neutral-600 mb-2">
        {song.artist && (
          <>
            <span>{song.artist}</span>
            <span className="text-neutral-300">·</span>
          </>
        )}
        <span className="flex items-center gap-1">
          <Music className="h-3 w-3" />
          {song.keySignature || '-'}
        </span>
        <span className="text-neutral-300">·</span>
        <span className="font-mono">{song.bpm || '-'} BPM</span>
        {song.ccliNumber && (
          <>
            <span className="text-neutral-300">·</span>
            <span className="text-neutral-500">CCLI {song.ccliNumber}</span>
          </>
        )}
      </div>
      {/* 3줄: Song Form 요약 (placeholder) */}
      <div className="mb-3 py-2 px-3 bg-neutral-50 rounded text-xs text-neutral-500 italic">
        Song Form: (추후 추가 예정)
      </div>
      {/* 4줄: 링크 아이콘 */}
      <div className="flex items-center gap-2 mb-2">
        {song.sheetMusicUrl ? (
          <a
            href={song.sheetMusicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <FileText className="h-3 w-3" />
            악보
          </a>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-neutral-400">
            <FileText className="h-3 w-3" />
            악보
          </span>
        )}
        
        {song.youtubeUrl ? (
          <a
            href={song.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <Youtube className="h-3 w-3" />
            유튜브
          </a>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-neutral-400">
            <Youtube className="h-3 w-3" />
            유튜브
          </span>
        )}
      </div>
      {/* 5줄: 노트 한 줄 미리보기 */}
      {song.note && (
        <p className="text-xs text-neutral-500 line-clamp-1 bg-amber-50 px-2 py-1 rounded">
          💡 {song.note}
        </p>
      )}
    </div>
  )
}
