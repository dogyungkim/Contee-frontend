import { ClipboardList, Download, FileText, Loader2, Youtube } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface ContiExportMenuProps {
  sheetMusicCount?: number
  isPdfDownloading?: boolean
  onDownloadPdf?: () => void
  onCopyYoutubeReferences: (includeKeyAndBpm?: boolean) => void
}

export function ContiExportMenu({
  sheetMusicCount,
  isPdfDownloading = false,
  onDownloadPdf,
  onCopyYoutubeReferences,
}: ContiExportMenuProps) {
  const canDownloadPdf = typeof onDownloadPdf === 'function'
  const hasSheetMusic = (sheetMusicCount ?? 0) > 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2">
          {isPdfDownloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">내보내기</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        {canDownloadPdf && (
          <>
            <DropdownMenuItem
              disabled={!hasSheetMusic || isPdfDownloading}
              onClick={onDownloadPdf}
            >
              {isPdfDownloading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              {isPdfDownloading ? 'PDF 생성 중' : `악보 PDF (${sheetMusicCount ?? 0})`}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={() => onCopyYoutubeReferences(false)}>
          <Youtube className="mr-2 h-4 w-4 text-red-500" />
          유튜브 레퍼런스 복사
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onCopyYoutubeReferences(true)}>
          <ClipboardList className="mr-2 h-4 w-4" />
          Key/BPM 포함 복사
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
