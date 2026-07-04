import { useState } from 'react'

import {
  useDisableExternalShare,
  useEnableExternalShare,
} from '@/domains/conti/hooks/use-conti'
import type { ExternalShare } from '@/types/conti'
import type { ContiShareDialogMode } from '@/domains/conti/components/conti-share-dialog'
import { getContiApiErrorMessage } from '@/domains/conti/utils/conti-error'
import { toast } from '@/lib/toast'

interface UseContiSharingOptions {
  contiId: string
  externalShare?: ExternalShare
  hasChanges?: boolean
}

export function useContiSharing({
  contiId,
  externalShare,
  hasChanges = false,
}: UseContiSharingOptions) {
  const [dialogMode, setDialogMode] = useState<ContiShareDialogMode>(null)
  const { mutateAsync: enableExternalShare, isPending: isEnabling } = useEnableExternalShare()
  const { mutateAsync: disableExternalShare, isPending: isDisabling } = useDisableExternalShare()

  const buildUrl = (path: string) => {
    if (typeof window === 'undefined' || /^https?:\/\//.test(path)) return path
    return `${window.location.origin}${path}`
  }

  const copyToClipboard = async (value: string, successMessage: string) => {
    if (typeof window === 'undefined') return

    try {
      await window.navigator.clipboard.writeText(value)
      toast.success(successMessage)
    } catch {
      toast.error('링크 복사에 실패했습니다.')
    }
  }

  const copyTeamShare = async () => {
    await copyToClipboard(
      buildUrl(`/dashboard/contis/${contiId}`),
      '팀 공유 링크를 복사했습니다.',
    )
  }

  const copyExternalShare = async () => {
    if (!externalShare?.url) {
      toast.error('활성화된 외부 공유 링크가 없습니다.')
      return
    }
    await copyToClipboard(buildUrl(externalShare.url), '외부 공유 링크를 복사했습니다.')
  }

  const enable = async () => {
    if (hasChanges) {
      toast.error('외부 공유 전에 변경사항을 먼저 저장해주세요.')
      return
    }

    try {
      const createdShare = await enableExternalShare(contiId)
      setDialogMode(null)
      if (createdShare.url) {
        await copyToClipboard(
          buildUrl(createdShare.url),
          '외부 공유 링크를 만들고 복사했습니다.',
        )
        return
      }
      toast.success('외부 공유를 켰습니다.')
    } catch (error) {
      toast.error(getContiApiErrorMessage(error, '외부 공유를 켜지 못했습니다.'))
    }
  }

  const disable = async () => {
    try {
      await disableExternalShare(contiId)
      setDialogMode(null)
      toast.success('외부 공유를 껐습니다.')
    } catch (error) {
      toast.error(getContiApiErrorMessage(error, '외부 공유를 끄지 못했습니다.'))
    }
  }

  return {
    dialogMode,
    setDialogMode,
    isEnabling,
    isDisabling,
    isPending: isEnabling || isDisabling,
    copyTeamShare,
    copyExternalShare,
    confirmDialog: (mode: Exclude<ContiShareDialogMode, null>) => {
      if (mode === 'enable') {
        void enable()
        return
      }
      void disable()
    },
  }
}
