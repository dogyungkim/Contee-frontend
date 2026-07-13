import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ContiEditorActionBarProps {
  isDraft: boolean
  hasChanges: boolean
  isSaving: boolean
  onCancel: () => void
  onSave: () => void
  badgeLabel?: string
  description?: string
  saveLabel?: string
  savingLabel?: string
  saveDisabled?: boolean
  secondaryAction?: {
    label: string
    onClick: () => void
    disabled?: boolean
  }
}

export function ContiEditorActionBar({
  isDraft,
  hasChanges,
  isSaving,
  onCancel,
  onSave,
  badgeLabel = '수정 중',
  description,
  saveLabel,
  savingLabel = '저장 중...',
  saveDisabled,
  secondaryAction,
}: ContiEditorActionBarProps) {
  const actionDescription =
    description ??
    (isDraft
      ? '임시 저장한 내용은 팀에 공개하기 전까지 작성자에게만 보입니다.'
      : '저장하면 변경사항이 팀원에게 바로 반영됩니다.')
  const primaryLabel = saveLabel ?? (isDraft ? '임시 저장 후 닫기' : '저장 후 닫기')
  const isSaveDisabled = saveDisabled ?? !hasChanges

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-2 z-40 px-3 sm:bottom-4 sm:px-5 md:px-7 lg:px-9">
      <div className="pointer-events-auto mx-auto flex w-full max-w-[1200px] flex-col gap-3 rounded-2xl border bg-background/95 px-3 py-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
              {badgeLabel}
            </Badge>
            {hasChanges && (
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">
                변경사항 있음
              </Badge>
            )}
          </div>
          <p className="text-xs leading-5 text-muted-foreground sm:text-sm">{actionDescription}</p>
        </div>

        <div className={cn(
          'grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center',
          !secondaryAction && 'grid-cols-2',
        )}>
          <Button
            variant="outline"
            className="flex-1 sm:flex-none"
            onClick={onCancel}
            disabled={isSaving}
          >
            취소
          </Button>
          {secondaryAction && (
            <Button
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={secondaryAction.onClick}
              disabled={isSaving || secondaryAction.disabled}
            >
              {secondaryAction.label}
            </Button>
          )}
          <Button
            className={cn('flex-1 sm:flex-none', secondaryAction && 'col-span-2 sm:col-span-1')}
            onClick={onSave}
            disabled={isSaving || isSaveDisabled}
          >
            {isSaving ? savingLabel : primaryLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
