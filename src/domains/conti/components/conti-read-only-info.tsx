'use client'

import { BookOpen, ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { parseBibleVerse } from '@/domains/conti/utils/conti-editor'

interface ContiReadOnlyInfoProps {
  memo?: string
  bibleVerse?: string
  sharingInfo?: string
  layout?: 'stacked' | 'split'
  collapsible?: boolean
  isWordSharingOpen?: boolean
  onWordSharingOpenChange?: (open: boolean) => void
}

export function ContiReadOnlyInfo({
  memo,
  bibleVerse,
  sharingInfo,
  layout = 'stacked',
  collapsible = false,
  isWordSharingOpen = true,
  onWordSharingOpenChange,
}: ContiReadOnlyInfoProps) {
  const verse = parseBibleVerse(bibleVerse)
  const hasWordSharing = !!bibleVerse || !!sharingInfo

  if (!memo && !hasWordSharing) return null

  const wordSharingHeader = (
    <>
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50">
          <BookOpen className="h-4 w-4 text-neutral-600" />
        </div>
        <h3 className="type-card-title text-neutral-900">말씀 & 나눔</h3>
      </div>
      {collapsible && (
        <ChevronDown
          className={cn(
            'h-4 w-4 text-neutral-600 transition-transform duration-200',
            isWordSharingOpen ? 'rotate-180' : 'rotate-0',
          )}
        />
      )}
    </>
  )

  return (
    <div
      className={cn(
        layout === 'split' ? 'grid gap-4 lg:grid-cols-[0.9fr_1.1fr]' : 'space-y-6',
      )}
    >
      {memo && (
        <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
          <p className="type-label mb-2 text-amber-600">특이사항</p>
          <p className="type-body-sm whitespace-pre-wrap text-neutral-600">{memo}</p>
        </div>
      )}

      {hasWordSharing && (
        <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
          {collapsible ? (
            <button
              type="button"
              className="flex w-full items-center justify-between gap-2 text-left"
              onClick={() => onWordSharingOpenChange?.(!isWordSharingOpen)}
              aria-expanded={isWordSharingOpen}
              aria-controls="read-only-word-sharing-content"
            >
              {wordSharingHeader}
            </button>
          ) : (
            <div className="flex items-center justify-between gap-2">{wordSharingHeader}</div>
          )}

          {isWordSharingOpen && (
            <div id="read-only-word-sharing-content" className="mt-3 space-y-4">
              {bibleVerse && (
                <div className="rounded-lg border border-neutral-200 bg-neutral-50/40 p-3 sm:p-4">
                  <p className="type-label mb-1 text-neutral-700">본문</p>
                  {verse.reference && (
                    <p className="type-body-sm font-semibold text-neutral-900">{verse.reference}</p>
                  )}
                  {verse.content && (
                    <p className="type-body-sm mt-1 whitespace-pre-wrap text-neutral-700">
                      {verse.content}
                    </p>
                  )}
                </div>
              )}

              {sharingInfo && (
                <div className="rounded-lg border border-neutral-200 bg-neutral-50/40 p-3 sm:p-4">
                  <p className="type-label mb-1 text-neutral-700">나눔</p>
                  <p className="type-body-sm whitespace-pre-wrap text-neutral-700">
                    {sharingInfo}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
