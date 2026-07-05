import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export type ContiShareDialogMode = 'enable' | 'disable' | 'copy' | null
export type ContiShareConfirmationMode = Exclude<ContiShareDialogMode, 'copy' | null>

interface ContiShareDialogProps {
  mode: ContiShareDialogMode
  isPending: boolean
  shareUrl?: string | null
  onClose: () => void
  onConfirm: (mode: ContiShareConfirmationMode) => void
  onCopy: () => void
}

export function ContiShareDialog({
  mode,
  isPending,
  shareUrl,
  onClose,
  onConfirm,
  onCopy,
}: ContiShareDialogProps) {
  const isCopyMode = mode === 'copy'

  return (
    <Dialog open={mode !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'enable'
              ? '외부 공유를 켤까요?'
              : mode === 'disable'
                ? '외부 공유를 끌까요?'
                : '외부 공유 링크를 만들었습니다'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'enable'
              ? '외부 공유를 켜면 링크를 가진 누구나 로그인 없이 이 콘티를 볼 수 있습니다.'
              : mode === 'disable'
                ? '외부 공유를 끄면 기존 링크로 더 이상 이 콘티를 볼 수 없습니다.'
                : '아래 버튼을 눌러 생성된 링크를 복사하세요.'}
          </DialogDescription>
        </DialogHeader>
        {isCopyMode && (
          <Input
            aria-label="외부 공유 링크"
            value={shareUrl ?? ''}
            readOnly
            onFocus={(event) => event.currentTarget.select()}
          />
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {isCopyMode ? '닫기' : '취소'}
          </Button>
          {isCopyMode ? (
            <Button onClick={onCopy}>링크 복사</Button>
          ) : (
            <Button
              variant={mode === 'disable' ? 'destructive' : 'default'}
              onClick={() => mode && onConfirm(mode)}
              disabled={isPending}
            >
              {mode === 'enable' ? '외부 공유 켜기' : '외부 공유 끄기'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
