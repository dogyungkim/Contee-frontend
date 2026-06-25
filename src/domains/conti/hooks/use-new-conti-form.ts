'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { useCreateConti } from '@/domains/conti/hooks/use-conti'
import { TeamSong, CreateTeamSongRequest, SongFormPartRequest } from '@/types/song'
import { ContiSongRequestItem } from '@/types/conti'
import { toast } from '@/lib/toast'
import { formatWorshipTime } from '@/domains/conti/utils/worship-time'

// Temp Song Type for UI State
export interface TempContiSong {
    tempId: string
    isNewSong: boolean
    orderIndex: number

    // Common/Override Display Data
    customTitle: string
    artist?: string
    keySignature?: string
    bpm?: number

    // Existing Song Ref
    teamSongId?: string
    teamSong?: TeamSong

    // New Song Data
    youtubeUrl?: string
    sheetMusicUrl?: string
    note?: string // Library note (for new songs) or just note
    songForm?: SongFormPartRequest[] // Song structure for new songs

    // Conti Specific
    contiNote?: string
}

export const useNewContiForm = (teamId: string | null) => {
    const router = useRouter()

    // Worship Info State
    const [date, setDate] = useState<Date>(new Date())
    const [period, setPeriod] = useState<string>("AM")
    const [hour, setHour] = useState<string>("10")
    const [minute, setMinute] = useState<string>("00")
    const [title, setTitle] = useState<string>("")
    const [memo, setMemo] = useState<string>("")
    const [bibleVerseReference, setBibleVerseReference] = useState<string>("")
    const [bibleVerseContent, setBibleVerseContent] = useState<string>("")
    const [sharingInfo, setSharingInfo] = useState<string>("")

    // Song List State
    const [tempSongs, setTempSongs] = useState<TempContiSong[]>([])

    // UI State
    const [isSaving, setIsSaving] = useState(false)

    const { mutateAsync: createContiAsync } = useCreateConti()

    const handleSave = async () => {
        if (!title.trim()) {
            toast.error('예배 제목을 입력해주세요.')
            return
        }

        if (!teamId) {
            toast.error('팀이 선택되지 않았습니다.')
            return
        }

        setIsSaving(true)
        try {
            // API 계약: worshipDate는 YYYY-MM-DD 형식
            const worshipDate = format(date, 'yyyy-MM-dd')
            const worshipTime = formatWorshipTime({ period, hour, minute })
            const formattedBibleVerse = [bibleVerseReference.trim(), bibleVerseContent.trim()]
                .filter(Boolean)
                .join('\n')

            // 2. Map tempSongs to API Request Items
            const contiSongsRequest: ContiSongRequestItem[] = tempSongs.map((song, idx) => {
                const base = {
                    orderIndex: idx,
                    key: song.keySignature,
                    bpm: song.bpm,
                    note: song.contiNote
                }

                if (song.isNewSong) {
                    // Case 2: New Song
                    return {
                        ...base,
                        title: song.customTitle,
                        artist: song.artist,
                        defaultKey: song.keySignature,
                        defaultBpm: song.bpm,
                        youtubeUrl: song.youtubeUrl,
                        sheetMusicUrl: song.sheetMusicUrl,
                        teamNote: song.note,
                        songForm: song.songForm,
                    }
                } else {
                    // Case 1: Existing Song
                    return {
                        ...base,
                        teamSongId: song.teamSongId!,
                    }
                }
            })

            // 3. createConti with nested songs
            const newConti = await createContiAsync({
                teamId,
                title,
                worshipDate,
                worshipTime,
                memo: memo.trim() || undefined,
                bibleVerse: formattedBibleVerse || undefined,
                sharingInfo: sharingInfo.trim() || undefined,
                contiSongs: contiSongsRequest
            })

            // 4. Redirect
            router.push(`/dashboard/contis/${newConti.id}`)
        } catch (error) {
            console.error('Failed to create conti:', error)
            toast.error('콘티 생성 중 오류가 발생했습니다.')
        } finally {
            setIsSaving(false)
        }
    }

    const addExistingSong = (song: TeamSong) => {
        setTempSongs((prev) => [
            ...prev,
            {
                tempId: `temp-${Date.now()}`,
                isNewSong: false,
                orderIndex: prev.length,
                teamSongId: song.id,
                teamSong: song,
                customTitle: song.title,
                artist: song.artist,
                keySignature: song.keySignature,
                bpm: song.bpm,
                note: song.note,
            },
        ])
    }

    const addNewSong = (data: CreateTeamSongRequest) => {
        setTempSongs((prev) => [
            ...prev,
            {
                tempId: `new-${Date.now()}`,
                isNewSong: true,
                orderIndex: prev.length,
                customTitle: data.title,
                artist: data.artist,
                keySignature: data.keySignature,
                bpm: data.bpm,
                youtubeUrl: data.youtubeUrl,
                sheetMusicUrl: data.sheetMusicUrl,
                note: data.note,
                songForm: data.songForm,
            },
        ])
    }

    const removeSong = (tempId: string) => {
        setTempSongs((prev) =>
            prev
                .filter((song) => song.tempId !== tempId)
                .map((song, index) => ({ ...song, orderIndex: index }))
        )
    }

    const updateSong = (tempId: string, data: CreateTeamSongRequest) => {
        setTempSongs((prev) =>
            prev.map((song) => {
                if (song.tempId !== tempId) return song

                return {
                    ...song,
                    customTitle: data.title,
                    artist: data.artist,
                    keySignature: data.keySignature,
                    bpm: data.bpm,
                    youtubeUrl: song.isNewSong ? data.youtubeUrl : song.youtubeUrl,
                    sheetMusicUrl: song.isNewSong ? data.sheetMusicUrl : song.sheetMusicUrl,
                    note: song.isNewSong ? data.note : song.note,
                    contiNote: song.isNewSong ? song.contiNote : data.note,
                    songForm: song.isNewSong ? data.songForm : song.songForm,
                }
            })
        )
    }

    const moveSong = (tempId: string, direction: 'up' | 'down') => {
        setTempSongs((prev) => {
            const currentIndex = prev.findIndex((song) => song.tempId === tempId)
            if (currentIndex < 0) return prev

            const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
            if (nextIndex < 0 || nextIndex >= prev.length) return prev

            const next = [...prev]
            const [song] = next.splice(currentIndex, 1)
            next.splice(nextIndex, 0, song)

            return next.map((item, index) => ({ ...item, orderIndex: index }))
        })
    }

    return {
        // Worship Info
        date,
        setDate,
        period,
        setPeriod,
        hour,
        setHour,
        minute,
        setMinute,
        title,
        setTitle,
        memo,
        setMemo,
        bibleVerseReference,
        setBibleVerseReference,
        bibleVerseContent,
        setBibleVerseContent,
        sharingInfo,
        setSharingInfo,

        // Songs
        tempSongs,
        addExistingSong,
        addNewSong,
        updateSong,
        moveSong,
        removeSong,

        // Actions
        handleSave,
        isSaving,
    }
}
