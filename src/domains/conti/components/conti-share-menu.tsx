import { Clipboard, Link2, Share2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface ContiShareMenuProps {
  isPublished: boolean
  externalShareEnabled: boolean
  canManageExternalShare: boolean
  hasChanges: boolean
  isEnabling: boolean
  isDisabling: boolean
  onCopyTeamShare: () => void
  onCopyExternalShare: () => void
  onRequestExternalShare: (mode: 'enable' | 'disable') => void
}

export function ContiShareMenu({
  isPublished,
  externalShareEnabled,
  canManageExternalShare,
  hasChanges,
  isEnabling,
  isDisabling,
  onCopyTeamShare,
  onCopyExternalShare,
  onRequestExternalShare,
}: ContiShareMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2">
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">공유</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {!isPublished ? (
          <DropdownMenuItem disabled>팀에 공유한 뒤 링크 공유 가능</DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem onClick={onCopyTeamShare}>
              <Clipboard className="mr-2 h-4 w-4" />
              팀 공유 링크 복사
            </DropdownMenuItem>
            {hasChanges && <DropdownMenuItem disabled>변경사항 저장 후 공유 가능</DropdownMenuItem>}
          </>
        )}
        {isPublished && canManageExternalShare && !hasChanges && (
          <>
            <DropdownMenuSeparator />
            {externalShareEnabled ? (
              <>
                <DropdownMenuItem onClick={onCopyExternalShare}>
                  <Link2 className="mr-2 h-4 w-4" />
                  외부 공유 링크 복사
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  disabled={isDisabling}
                  onClick={() => onRequestExternalShare('disable')}
                >
                  <X className="mr-2 h-4 w-4" />
                  외부 공유 끄기
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem
                disabled={isEnabling}
                onClick={() => onRequestExternalShare('enable')}
              >
                <Link2 className="mr-2 h-4 w-4" />
                외부 공유 링크 만들기
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
