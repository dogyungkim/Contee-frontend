'use client'

import { BookOpen, ChevronDown } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
interface ContiEditInfoProps {
  memo?: string
  sharingInfo?: string
  bibleVerseReference: string
  bibleVerseContent: string
  isWordSharingOpen: boolean
  onWordSharingOpenChange: (open: boolean) => void
  onMemoChange: (value: string) => void
  onBibleVerseReferenceChange: (value: string) => void
  onBibleVerseContentChange: (value: string) => void
  onSharingInfoChange: (value: string) => void
}

export function ContiEditInfo({
  memo,
  sharingInfo,
  bibleVerseReference,
  bibleVerseContent,
  isWordSharingOpen,
  onWordSharingOpenChange,
  onMemoChange,
  onBibleVerseReferenceChange,
  onBibleVerseContentChange,
  onSharingInfoChange,
}: ContiEditInfoProps) {
  return (
    <>
      <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
        <p className="mb-2 text-xs font-bold text-amber-600">특이사항</p>
        <Textarea
          value={memo}
          onChange={(event) => onMemoChange(event.target.value)}
          placeholder="예배 진행 관련 메모를 입력하세요."
          className="min-h-[100px] resize-none"
        />
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 text-left"
            onClick={() => onWordSharingOpenChange(!isWordSharingOpen)}
            aria-expanded={isWordSharingOpen}
            aria-controls="word-sharing-content"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50">
                <BookOpen className="h-4 w-4 text-neutral-600" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900">말씀 & 나눔</h3>
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-neutral-600 transition-transform duration-200',
                isWordSharingOpen ? 'rotate-180' : 'rotate-0',
              )}
            />
          </button>

          {isWordSharingOpen && (
            <div id="word-sharing-content" className="mt-3 space-y-4">
              <div className="rounded-lg border border-neutral-200 bg-neutral-50/40 p-3 sm:p-4">
                <p className="mb-1 text-xs font-bold text-neutral-700">본문</p>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="bible-verse-reference">본문 위치</Label>
                    <Input
                      id="bible-verse-reference"
                      value={bibleVerseReference}
                      onChange={(event) => onBibleVerseReferenceChange(event.target.value)}
                      placeholder="예: 시편 23편"
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bible-verse-content">본문</Label>
                    <Textarea
                      id="bible-verse-content"
                      value={bibleVerseContent}
                      onChange={(event) => onBibleVerseContentChange(event.target.value)}
                      placeholder="본문 내용을 입력하세요."
                      className="min-h-[120px] resize-none bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-neutral-200 bg-neutral-50/40 p-3 sm:p-4">
                <p className="mb-1 text-xs font-bold text-neutral-700">나눔</p>
                <Textarea
                  value={sharingInfo}
                  onChange={(event) => onSharingInfoChange(event.target.value)}
                  placeholder="팀 나눔 내용을 입력하세요."
                  className="min-h-[140px] resize-none bg-white"
                />
              </div>
            </div>
          )}
      </div>
    </>
  )
}
