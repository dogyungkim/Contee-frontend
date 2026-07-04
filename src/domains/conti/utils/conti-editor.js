/**
 * @param {string | undefined} value
 */
export function parseBibleVerse(value) {
  const lines = value
    ? value
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
    : []

  return {
    reference: lines[0] ?? '',
    content: lines.slice(1).join('\n'),
  }
}

/**
 * @param {import('../models/conti').Conti} conti
 */
export function createContiDraft(conti) {
  const verse = parseBibleVerse(conti.bibleVerse)
  const [rawHour = 10, rawMinute = 0] = conti.worshipTime.split(':').map(Number)
  const period = rawHour >= 12 ? 'PM' : 'AM'
  const hour = rawHour % 12 || 12

  return {
    title: conti.title,
    worshipDate: conti.worshipDate,
    period,
    hour: String(hour).padStart(2, '0'),
    minute: String(rawMinute).padStart(2, '0'),
    memo: conti.memo ?? '',
    bibleVerseReference: verse.reference,
    bibleVerseContent: verse.content,
    sharingInfo: conti.sharingInfo ?? '',
    songs: conti.contiSongs ?? [],
  }
}

/**
 * @param {string} pathname
 * @param {string} currentQuery
 * @param {'view' | 'edit'} mode
 */
export function buildContiModeHref(pathname, currentQuery, mode) {
  const params = new URLSearchParams(currentQuery)

  if (mode === 'edit') {
    params.set('mode', 'edit')
  } else {
    params.delete('mode')
  }

  const query = params.toString()
  return query ? `${pathname}?${query}` : pathname
}

/**
 * @param {import('../models/conti').ContiSong} song
 */
export function getContiSongDisplay(song) {
  return {
    title: song.title,
    artist: song.artist || song.teamSong?.artist,
    keySignature: song.key,
    bpm: song.bpm,
    note: song.note,
    teamNote: song.teamSong?.note,
    youtubeUrl: song.youtubeUrl || song.teamSong?.youtubeUrl,
    sheetMusicUrl: song.sheetMusicUrl || song.teamSong?.sheetMusicUrl,
    songForm: song.songForm,
  }
}

/**
 * @param {import('../models/conti').ContiSong[]} songs
 */
export function normalizeContiSongs(songs) {
  return songs.map((song, index) => ({
    id: song.id.startsWith('draft-song-') ? undefined : song.id,
    teamSongId: song.teamSongId,
    title: song.title,
    artist: song.artist,
    key: song.key,
    bpm: song.bpm,
    note: song.note,
    youtubeUrl: song.youtubeUrl,
    sheetMusicUrl: song.sheetMusicUrl,
    orderIndex: index,
    songForm: song.songForm,
  }))
}

/**
 * @param {import('../models/conti').ContiSong[]} songs
 * @returns {import('../api/conti.dto').ContiSongRequestItemDto[]}
 */
export function buildContiSongRequests(songs) {
  return songs.map((song, index) => {
    const base = {
      artist: song.artist,
      youtubeUrl: song.youtubeUrl,
      sheetMusicUrl: song.sheetMusicUrl,
      orderIndex: index,
      key: song.key,
      bpm: song.bpm,
      note: song.note,
      songForm: song.songForm?.map((part) => ({
        partType: part.partType,
        customPartName: part.customPartName,
        repeatCount: part.repeatCount,
        barCount: part.barCount,
        note: part.note,
      })),
    }

    if (!song.id.startsWith('draft-song-')) {
      return {
        ...base,
        id: song.id,
        title: song.title,
      }
    }

    if (song.teamSongId) {
      return {
        ...base,
        teamSongId: song.teamSongId,
      }
    }

    return {
      ...base,
      title: song.title,
      defaultKey: song.key,
      defaultBpm: song.bpm,
      teamNote: song.teamSong?.note,
    }
  })
}
