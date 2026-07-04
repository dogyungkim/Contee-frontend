const normalizeIdentity = (value) =>
  String(value ?? '')
    .toLocaleLowerCase()
    .replace(/\s+/g, '')

/**
 * @param {import('../models/song').TeamSong[]} songs
 * @param {{ title: string, artist?: string }} candidate
 * @param {string} [excludeSongId]
 */
export function findDuplicateSong(songs, candidate, excludeSongId) {
  const title = normalizeIdentity(candidate.title)
  const artist = normalizeIdentity(candidate.artist)

  return songs.find(
    (song) =>
      song.id !== excludeSongId &&
      normalizeIdentity(song.title) === title &&
      normalizeIdentity(song.artist) === artist,
  )
}

/**
 * @param {import('../models/song').TeamSong[]} songs
 * @param {string} query
 * @param {boolean} favoritesOnly
 */
export function filterSongLibrary(songs, query, favoritesOnly) {
  const normalizedQuery = query.trim().toLocaleLowerCase()

  return songs.filter((song) => {
    if (favoritesOnly && !song.isFavorite) return false
    if (!normalizedQuery) return true

    return [
      song.title,
      song.artist,
      song.keySignature,
      song.bpm,
    ].some((value) => String(value ?? '').toLocaleLowerCase().includes(normalizedQuery))
  })
}
