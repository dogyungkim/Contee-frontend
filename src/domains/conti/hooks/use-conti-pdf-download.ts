'use client'

import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'

import type { Conti } from '@/types/conti'
import {
  buildContiSheetMusicPdf,
  createContiPdfFilename,
  downloadPdf,
  getPdfSheetSources,
} from '@/domains/conti/utils/conti-pdf'

export function useContiPdfDownload(conti: Conti) {
  const [isDownloading, setIsDownloading] = useState(false)
  const sources = useMemo(
    () => getPdfSheetSources(conti.contiSongs ?? []),
    [conti.contiSongs],
  )

  const download = async () => {
    if (sources.length === 0 || isDownloading) return

    setIsDownloading(true)
    try {
      const result = await buildContiSheetMusicPdf(sources)
      downloadPdf(
        result.bytes,
        createContiPdfFilename(conti.title, conti.worshipDate),
      )

      if (result.failures.length > 0) {
        const failedTitles = result.failures.map((failure) => failure.title).join(', ')
        toast(`PDF를 만들었지만 ${failedTitles} 악보는 제외됐습니다.`, {
          icon: '⚠️',
        })
      } else {
        toast.success(`${result.mergedCount}곡의 악보 PDF를 다운로드했습니다.`)
      }
    } catch (error) {
      const failures =
        error instanceof Error &&
        'failures' in error &&
        Array.isArray(error.failures)
          ? error.failures
          : []
      const failedTitles = failures
        .map((failure) =>
          typeof failure === 'object' &&
          failure !== null &&
          'title' in failure &&
          typeof failure.title === 'string'
            ? failure.title
            : null,
        )
        .filter(Boolean)
        .join(', ')

      toast.error(
        failedTitles
          ? `${failedTitles} 악보를 불러오지 못했습니다. 파일 접근 권한을 확인해주세요.`
          : '악보 PDF를 만들지 못했습니다. 잠시 후 다시 시도해주세요.',
      )
    } finally {
      setIsDownloading(false)
    }
  }

  return {
    sheetMusicCount: sources.length,
    isDownloading,
    download,
  }
}
