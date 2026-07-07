import { useState } from 'react'

import {
  useDisableExternalShare,
  useEnableExternalShare,
} from '@/domains/conti/hooks/use-conti'
import type { Conti, ExternalShare } from '@/types/conti'
import type {
  ContiShareConfirmationMode,
  ContiShareDialogMode,
} from '@/domains/conti/components/conti-share-dialog'
import { getContiApiErrorMessage } from '@/domains/conti/utils/conti-error'
import {
  buildContiYoutubeReferenceText,
  getExternalShareCompletion,
} from '@/domains/conti/utils/conti-sharing'
import { toast } from '@/lib/toast'

interface UseContiSharingOptions {
  contiId: string
  conti?: Conti
  externalShare?: ExternalShare
  hasChanges?: boolean
}

export function useContiSharing({
  contiId,
  conti,
  externalShare,
  hasChanges = false,
}: UseContiSharingOptions) {
  const [dialogMode, setDialogMode] = useState<ContiShareDialogMode>(null)
  const [createdShareUrl, setCreatedShareUrl] = useState<string | null>(null)
  const { mutateAsync: enableExternalShare, isPending: isEnabling } = useEnableExternalShare()
  const { mutateAsync: disableExternalShare, isPending: isDisabling } = useDisableExternalShare()

  const buildUrl = (path: string) => {
    if (typeof window === 'undefined' || /^https?:\/\//.test(path)) return path
    return `${window.location.origin}${path}`
  }

  const copyToClipboard = async (
    value: string,
    successMessage: string,
    failureMessage = '링크 복사에 실패했습니다.',
  ) => {
    if (typeof window === 'undefined') return false

    try {
      await window.navigator.clipboard.writeText(value)
      toast.success(successMessage)
      return true
    } catch {
      toast.error(failureMessage)
      return false
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

  const copyYoutubeReferences = async (includeKeyAndBpm = false) => {
    if (!conti) {
      toast.error('복사할 콘티 정보가 없습니다.')
      return
    }

    const referenceText = buildContiYoutubeReferenceText(conti, { includeKeyAndBpm })

    if (!referenceText) {
      toast.error('유튜브 링크가 있는 곡이 없습니다.')
      return
    }

    await copyToClipboard(
      referenceText,
      includeKeyAndBpm
        ? 'Key/BPM을 포함한 유튜브 레퍼런스를 복사했습니다.'
        : '유튜브 레퍼런스를 복사했습니다.',
      '유튜브 레퍼런스 복사에 실패했습니다.',
    )
  }

  const enable = async () => {
    if (hasChanges) {
      toast.error('외부 공유 전에 변경사항을 먼저 저장해주세요.')
      return
    }

    try {
      const createdShare = await enableExternalShare(contiId)
      const completion = getExternalShareCompletion(
        createdShare.url ? buildUrl(createdShare.url) : null,
      )
      setCreatedShareUrl(completion.shareUrl)
      setDialogMode(completion.dialogMode)
      if (completion.shareUrl) {
        toast.success('외부 공유 링크를 만들었습니다.')
        return
      }
      toast.success('외부 공유를 켰습니다.')
    } catch (error) {
      toast.error(getContiApiErrorMessage(error, '외부 공유를 켜지 못했습니다.'))
    }
  }

  const copyCreatedExternalShare = async () => {
    if (!createdShareUrl) {
      toast.error('복사할 외부 공유 링크가 없습니다.')
      return
    }

    const copied = await copyToClipboard(createdShareUrl, '외부 공유 링크를 복사했습니다.')
    if (copied) setDialogMode(null)
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
    createdShareUrl,
    isEnabling,
    isDisabling,
    isPending: isEnabling || isDisabling,
    copyTeamShare,
    copyExternalShare,
    copyYoutubeReferences,
    copyCreatedExternalShare,
    confirmDialog: (mode: ContiShareConfirmationMode) => {
      if (mode === 'enable') {
        void enable()
        return
      }
      void disable()
    },
  }
}
