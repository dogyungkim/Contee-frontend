import apiClient from '@/lib/api'
import { getSafeHttpUrl, isSafeApiPath } from '@/lib/safe-url'

export async function openSheetMusic(url: string): Promise<void> {
  if (!isSafeApiPath(url)) {
    const safeUrl = getSafeHttpUrl(url)
    if (!safeUrl) {
      throw new Error('Unsafe sheet music URL')
    }

    const externalWindow = window.open(safeUrl, '_blank', 'noopener,noreferrer')
    if (!externalWindow) {
      alert('팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.') // 또는 토스트 UI 사용
    }
    return
  }

  const previewWindow = window.open('', '_blank')
  if (!previewWindow) {
    // 팝업이 차단된 경우 빠르게 실패 처리
    alert('팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.')
    return
  }

  try {
    const { data } = await apiClient.get<Blob>(url, { responseType: 'blob' })
    const objectUrl = URL.createObjectURL(data)

    previewWindow.location.href = objectUrl
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000)
  } catch (error) {
    previewWindow.close()
    throw error
  }
}
