import apiClient from '@/lib/api'

export async function openSheetMusic(url: string): Promise<void> {
  if (!url.startsWith('/api/')) {
    window.open(url, '_blank', 'noopener,noreferrer')
    return
  }

  const previewWindow = window.open('', '_blank')

  try {
    const { data } = await apiClient.get<Blob>(url, { responseType: 'blob' })
    const objectUrl = URL.createObjectURL(data)

    if (previewWindow) {
      previewWindow.location.href = objectUrl
    } else {
      window.open(objectUrl, '_blank', 'noopener,noreferrer')
    }
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000)
  } catch (error) {
    previewWindow?.close()
    throw error
  }
}
