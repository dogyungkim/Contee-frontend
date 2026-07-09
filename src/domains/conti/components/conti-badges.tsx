import { Share2 } from 'lucide-react'

import { Badge, type BadgeProps } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ContiStatus } from '@/types/conti'

interface ContiStatusBadgeProps extends Omit<BadgeProps, 'children' | 'variant'> {
  status: ContiStatus
}

interface ContiExternalShareBadgeProps extends Omit<BadgeProps, 'children' | 'variant'> {
  showIcon?: boolean
}

export function ContiStatusBadge({ status, className, ...props }: ContiStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        status === 'DRAFT'
          ? 'border-amber-200 bg-amber-50 text-amber-800'
          : 'border-blue-200 bg-blue-50 text-blue-700',
        className
      )}
      {...props}
    >
      {status === 'DRAFT' ? '작성 중' : '팀 공개됨'}
    </Badge>
  )
}

export function ContiExternalShareBadge({
  className,
  showIcon = true,
  ...props
}: ContiExternalShareBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn('gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-700', className)}
      {...props}
    >
      {showIcon && <Share2 className="h-3 w-3" />}
      외부 공유 중
    </Badge>
  )
}
