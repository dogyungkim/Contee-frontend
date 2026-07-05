import { useCallback, useState } from 'react'
import { format } from 'date-fns'

import type { Conti, ContiSong, UpdateContiRequest } from '@/types/conti'
import {
  buildContiSongRequests,
  createContiDraft,
  normalizeContiSongs,
  parseBibleVerse,
} from '@/domains/conti/utils/conti-editor'
import {
  formatWorshipTime,
  normalizeWorshipTime,
} from '@/domains/conti/utils/worship-time'

export function useContiEditor(conti: Conti) {
  const initialDraft = createContiDraft(conti)
  const [title, setTitle] = useState(initialDraft.title)
  const [date, setDate] = useState<Date | undefined>(
    () => new Date(initialDraft.worshipDate),
  )
  const [period, setPeriod] = useState(initialDraft.period)
  const [hour, setHour] = useState(initialDraft.hour)
  const [minute, setMinute] = useState(initialDraft.minute)
  const [memo, setMemo] = useState(initialDraft.memo)
  const [bibleVerseReference, setBibleVerseReference] = useState(initialDraft.bibleVerseReference)
  const [bibleVerseContent, setBibleVerseContent] = useState(initialDraft.bibleVerseContent)
  const [sharingInfo, setSharingInfo] = useState(initialDraft.sharingInfo)
  const [songs, setSongs] = useState<ContiSong[]>(initialDraft.songs)

  const reset = useCallback((source: Conti) => {
    const draft = createContiDraft(source)

    setTitle(draft.title)
    setDate(new Date(draft.worshipDate))
    setPeriod(draft.period)
    setHour(draft.hour)
    setMinute(draft.minute)
    setMemo(draft.memo)
    setBibleVerseReference(draft.bibleVerseReference)
    setBibleVerseContent(draft.bibleVerseContent)
    setSharingInfo(draft.sharingInfo)
    setSongs(draft.songs)
  }, [])

  const originalVerse = parseBibleVerse(conti?.bibleVerse)
  const hasMetadataChanges =
    !!conti &&
    (title !== conti.title ||
      (date ? format(date, 'yyyy-MM-dd') : '') !== conti.worshipDate ||
      formatWorshipTime({ period, hour, minute }) !== normalizeWorshipTime(conti.worshipTime) ||
      memo !== (conti.memo ?? '') ||
      bibleVerseReference !== originalVerse.reference ||
      bibleVerseContent !== originalVerse.content ||
      sharingInfo !== (conti.sharingInfo ?? ''))
  const hasSongChanges =
    !!conti &&
    JSON.stringify(normalizeContiSongs(songs)) !==
      JSON.stringify(normalizeContiSongs(conti.contiSongs ?? []))
  const hasChanges = hasMetadataChanges || hasSongChanges

  const createUpdateRequest = (): UpdateContiRequest | null => {
    if (!date) return null

    const bibleVerse = [bibleVerseReference.trim(), bibleVerseContent.trim()]
      .filter(Boolean)
      .join('\n')

    return {
      title: title.trim(),
      worshipDate: format(date, 'yyyy-MM-dd'),
      worshipTime: formatWorshipTime({ period, hour, minute }),
      memo: memo.trim() || undefined,
      bibleVerse: bibleVerse || undefined,
      sharingInfo: sharingInfo.trim() || undefined,
      contiSongs: buildContiSongRequests(songs),
    }
  }

  return {
    draft: {
      title,
      date,
      period,
      hour,
      minute,
      memo,
      bibleVerseReference,
      bibleVerseContent,
      sharingInfo,
      songs,
    },
    setters: {
      setTitle,
      setDate,
      setPeriod,
      setHour,
      setMinute,
      setMemo,
      setBibleVerseReference,
      setBibleVerseContent,
      setSharingInfo,
      setSongs,
    },
    hasChanges,
    reset,
    createUpdateRequest,
  }
}
