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
