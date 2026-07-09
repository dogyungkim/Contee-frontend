import { getContiSongDisplay } from './conti-editor.js'

/**
 * @param {string | null | undefined} shareUrl
 * @returns {{ dialogMode: 'copy' | null, shareUrl: string | null }}
 */
export function getExternalShareCompletion(shareUrl) {
  if (!shareUrl) {
    return {
      dialogMode: null,
      shareUrl: null,
    }
  }

  return {
    dialogMode: 'copy',
    shareUrl,
  }
}

/**
 * @param {unknown} value
 */
function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

/**
 * @param {import('../models/conti').ContiSong} song
 */
function getReferenceSongDisplay(song) {
  const display = getContiSongDisplay(song)

  return {
    title: display.title?.trim() || '제목 없음',
    keySignature: display.keySignature || song.teamSong?.keySignature,
    bpm: isFiniteNumber(display.bpm) ? display.bpm : song.teamSong?.bpm,
    youtubeUrl: display.youtubeUrl?.trim(),
  }
}

/**
 * @param {import('../models/conti').ContiSong[]} songs
 */
function getOrderedSongs(songs) {
  return songs
    .map((song, index) => ({ song, index }))
    .sort((a, b) => {
      const aOrder = isFiniteNumber(a.song.orderIndex) ? a.song.orderIndex : a.index
      const bOrder = isFiniteNumber(b.song.orderIndex) ? b.song.orderIndex : b.index
      return aOrder - bOrder || a.index - b.index
    })
    .map(({ song }) => song)
}

/**
 * @param {import('../models/conti').Conti} conti
 * @param {{ includeKeyAndBpm?: boolean }} [options]
 * @returns {string}
 */
export function buildContiYoutubeReferenceText(conti, options = {}) {
  const includeKeyAndBpm = options.includeKeyAndBpm ?? false
  const songs = getOrderedSongs(conti.contiSongs ?? [])
    .map(getReferenceSongDisplay)
    .filter((song) => song.youtubeUrl)

  if (songs.length === 0) return ''

  const lines = songs.map((song, index) => {
    const meta = []

    if (includeKeyAndBpm && song.keySignature) {
      meta.push(`Key ${song.keySignature}`)
    }
    if (includeKeyAndBpm && isFiniteNumber(song.bpm)) {
      meta.push(`BPM ${song.bpm}`)
    }

    const title = meta.length > 0 ? `${song.title} (${meta.join(', ')})` : song.title
    return `${index + 1}. ${title}\n${song.youtubeUrl}`
  })

  return [conti.title?.trim() || '예배 제목 없음', '', ...lines].join('\n')
}
