'use client'

import { useEffect, useState } from 'react'

import apiClient from '@/lib/api'

const API_PROFILE_IMAGE_PATH = '/api/v1/users/'

const isServerProfileImageUrl = (url: string) => {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')

  return (
    url.startsWith(API_PROFILE_IMAGE_PATH) ||
    (!!apiBaseUrl && url.startsWith(`${apiBaseUrl}${API_PROFILE_IMAGE_PATH}`))
  )
}

export function useProfileImageSrc(profileImageUrl: string | null | undefined) {
  const [objectUrl, setObjectUrl] = useState<string>()

  useEffect(() => {
    if (!profileImageUrl || !isServerProfileImageUrl(profileImageUrl)) {
      setObjectUrl(undefined)
      return
    }

    let active = true
    const controller = new AbortController()
    let nextObjectUrl: string | undefined

    apiClient
      .get<Blob>(profileImageUrl, {
        responseType: 'blob',
        signal: controller.signal,
      })
      .then((response) => {
        if (!active) return
        nextObjectUrl = URL.createObjectURL(response.data)
        setObjectUrl(nextObjectUrl)
      })
      .catch((error: unknown) => {
        if (active && !controller.signal.aborted) {
          console.error('Profile image load failed:', error)
          setObjectUrl(undefined)
        }
      })

    return () => {
      active = false
      controller.abort()
      if (nextObjectUrl) {
        URL.revokeObjectURL(nextObjectUrl)
      }
    }
  }, [profileImageUrl])

  if (!profileImageUrl) return undefined
  if (isServerProfileImageUrl(profileImageUrl)) return objectUrl

  return profileImageUrl
}
