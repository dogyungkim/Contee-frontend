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
        "group relative rounded-lg border bg-white p-3 transition-all hover:border-primary/50 sm:p-4",
        isDisabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* 1줄: 곡 제목 */}
      <div className="mb-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <h4 className="type-emphasis min-w-0 break-words">
          {song.title}
          {song.isFavorite && (
            <Star className="inline-block ml-2 h-4 w-4 text-yellow-600 fill-current" />
          )}
        </h4>
        {isDisabled ? (
          <Badge variant="secondary" className="w-fit shrink-0">
            <Check className="h-3 w-3 mr-1" />
            추가됨
          </Badge>
        ) : (
          <Button
            size="sm"
            className="h-8 w-full shrink-0 sm:w-auto"
            onClick={onSelect}
          >
            선택
          </Button>
        )}
      </div>
      {/* 2줄: 아티스트 · 키 · BPM · CCLI */}
      <div className="type-body-sm mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-neutral-600">
        {song.artist && (
          <>
            <span className="min-w-0 break-words">{song.artist}</span>
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
      {/* 4줄: 링크 아이콘 */}
      <div className="mb-1 flex flex-wrap items-center gap-x-3 gap-y-1 sm:mb-2">
        {song.sheetMusicUrl ? (
          <a
            href={song.sheetMusicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="type-body-sm inline-flex items-center gap-1 text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <FileText className="h-3 w-3" />
            악보
          </a>
        ) : (
          <span className="type-body-sm inline-flex items-center gap-1 text-neutral-400">
            <FileText className="h-3 w-3" />
            악보
          </span>
        )}
        
        {song.youtubeUrl ? (
          <a
            href={song.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="type-body-sm inline-flex items-center gap-1 text-red-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <Youtube className="h-3 w-3" />
            유튜브
          </a>
        ) : (
          <span className="type-body-sm inline-flex items-center gap-1 text-neutral-400">
            <Youtube className="h-3 w-3" />
            유튜브
          </span>
        )}
      </div>
    </div>
  )
}
