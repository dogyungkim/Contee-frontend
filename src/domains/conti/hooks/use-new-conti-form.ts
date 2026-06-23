'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { useCreateConti } from '@/domains/conti/hooks/use-conti'
import { TeamSong, CreateTeamSongRequest, SongFormPartRequest } from '@/types/song'
import { ContiSongRequestItem } from '@/types/conti'
import { toast } from '@/lib/toast'

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
        const newTempSong: TempContiSong = {
            tempId: `temp-${Date.now()}`,
            isNewSong: false,
            orderIndex: tempSongs.length,
            teamSongId: song.id,
            teamSong: song,
            customTitle: song.title,
            artist: song.artist,
            keySignature: song.keySignature,
            bpm: song.bpm,
            note: song.note,
        }

        setTempSongs([...tempSongs, newTempSong])
    }

    const addNewSong = (data: CreateTeamSongRequest) => {
        const newTempSong: TempContiSong = {
            tempId: `new-${Date.now()}`,
            isNewSong: true,
            orderIndex: tempSongs.length,
            customTitle: data.title,
            artist: data.artist,
            keySignature: data.keySignature,
            bpm: data.bpm,
            youtubeUrl: data.youtubeUrl,
            sheetMusicUrl: data.sheetMusicUrl,
            note: data.note,
            songForm: data.songForm,
        }
        setTempSongs([...tempSongs, newTempSong])
    }

    const removeSong = (tempId: string) => {
        setTempSongs(tempSongs.filter(s => s.tempId !== tempId))
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
        removeSong,

        // Actions
        handleSave,
        isSaving,
    }
}
