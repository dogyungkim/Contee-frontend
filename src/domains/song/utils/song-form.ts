import { SongFormPart } from '@/types/song'

// Fixed definitions for available sections
export const AVAILABLE_SECTIONS: {
    type: SongFormPart['type']
    label: string
    abbr: string
    color: string
    bg: string
    border: string
}[] = [
        { type: 'Intro', label: 'Intro', abbr: 'Intro', color: 'bg-slate-300', bg: 'bg-slate-50', border: 'border-slate-300' },
        { type: 'Verse', label: 'Verse', abbr: 'V', color: 'bg-blue-400', bg: 'bg-blue-50', border: 'border-blue-400' },
        { type: 'Chorus', label: 'Chorus', abbr: 'C', color: 'bg-purple-400', bg: 'bg-purple-50', border: 'border-purple-400' },
        { type: 'Bridge', label: 'Bridge', abbr: 'B', color: 'bg-amber-400', bg: 'bg-amber-50', border: 'border-amber-400' },
        { type: 'Instrumental', label: 'Instrumental', abbr: 'Inst', color: 'bg-emerald-400', bg: 'bg-emerald-50', border: 'border-emerald-400' },
        { type: 'Interlude', label: 'Interlude', abbr: 'Inter', color: 'bg-cyan-400', bg: 'bg-cyan-50', border: 'border-cyan-400' },
        { type: 'Tag', label: 'Tag', abbr: 'Tag', color: 'bg-rose-400', bg: 'bg-rose-50', border: 'border-rose-400' },
        { type: 'Outro', label: 'Outro', abbr: 'Outro', color: 'bg-gray-400', bg: 'bg-gray-50', border: 'border-gray-400' }
    ]

export const getSectionStyle = (type: SongFormPart['type']) => {
    return AVAILABLE_SECTIONS.find(s => s.type === type) || AVAILABLE_SECTIONS[0]
}

export interface SongFormSummaryGroup {
    type: string
    abbr: string
    count: number
    showBars: boolean
    bars: number
}

/**
 * Groups consecutive song form parts of the same type for display in Flow Summary.
 * Handles special numbering for Verse, Interlude, and Tag sections.
 */
export const getSongFormSummary = (form: SongFormPart[]): SongFormSummaryGroup[] => {
    return form.reduce((acc: SongFormSummaryGroup[], part) => {
        const section = AVAILABLE_SECTIONS.find(s => s.type === part.type)

        // Use custom abbr if provided, otherwise use section abbr
        let abbr = part.abbr || section?.abbr || part.type
        const showBars = ['Intro', 'Interlude', 'Instrumental', 'Outro'].includes(part.type)

        // If Verse, Interlude, or Tag, attempt to extract number from label (Verse 1 -> V1)
        // Chorus and Bridge typically don't have numbers
        // Skip this if custom abbr is provided
        if (!part.abbr && ['Verse', 'Interlude', 'Tag'].includes(part.type)) {
            const num = (part.label || '').replace(/[^0-9]/g, '')
            if (num) abbr = `${abbr}${num}`
        }

        // Group only if same type, same abbreviation (handles V1 vs V2), and not a 'showBars' section
        if (acc.length > 0 && acc[acc.length - 1].type === part.type && acc[acc.length - 1].abbr === abbr && !showBars) {
            acc[acc.length - 1].count += 1
        } else {
            acc.push({ type: part.type, abbr: abbr, count: 1, showBars, bars: part.bars || 8 })
        }
        return acc
    }, [])
}
