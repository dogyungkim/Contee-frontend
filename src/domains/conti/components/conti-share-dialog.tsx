import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export type ContiShareDialogMode = 'enable' | 'disable' | null

interface ContiShareDialogProps {
  mode: ContiShareDialogMode
  isPending: boolean
  onClose: () => void
  onConfirm: (mode: Exclude<ContiShareDialogMode, null>) => void
}

export function ContiShareDialog({
  mode,
  isPending,
  onClose,
  onConfirm,
}: ContiShareDialogProps) {
  return (
    <Dialog open={mode !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'enable' ? '외부 공유를 켤까요?' : '외부 공유를 끌까요?'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'enable'
              ? '외부 공유를 켜면 링크를 가진 누구나 로그인 없이 이 콘티를 볼 수 있습니다.'
              : '외부 공유를 끄면 기존 링크로 더 이상 이 콘티를 볼 수 없습니다.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button
            variant={mode === 'disable' ? 'destructive' : 'default'}
            onClick={() => mode && onConfirm(mode)}
            disabled={isPending}
          >
            {mode === 'enable' ? '외부 공유 켜기' : '외부 공유 끄기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
