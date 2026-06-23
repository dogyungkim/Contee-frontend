'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const DEFAULT_MESSAGE = '저장하지 않은 변경사항이 있습니다. 이 페이지를 떠나시겠습니까?'

interface UseUnsavedChangesGuardOptions {
  enabled: boolean
  message?: string
}

export function useUnsavedChangesGuard({
  enabled,
  message = DEFAULT_MESSAGE,
}: UseUnsavedChangesGuardOptions) {
  const router = useRouter()
  const enabledRef = useRef(enabled)

  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

  useEffect(() => {
    if (!enabled) return

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [enabled])

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (!enabledRef.current || event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const target = event.target
      if (!(target instanceof Element)) return

      const anchor = target.closest<HTMLAnchorElement>('a[href]')
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return

      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('#')) return

      const nextUrl = new URL(anchor.href)
      if (nextUrl.origin !== window.location.origin) return

      const nextPath = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`
      const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`
      if (nextPath === currentPath) return

      event.preventDefault()
      if (window.confirm(message)) {
        router.push(nextPath)
      }
    }

    document.addEventListener('click', handleDocumentClick, true)
    return () => document.removeEventListener('click', handleDocumentClick, true)
  }, [message, router])

  useEffect(() => {
    if (!enabled) return

    window.history.pushState({ __unsavedChangesGuard: true }, '', window.location.href)

    const handlePopState = () => {
      if (!enabledRef.current) return

      if (window.confirm(message)) {
        enabledRef.current = false
        window.history.back()
        return
      }

      window.history.pushState({ __unsavedChangesGuard: true }, '', window.location.href)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [enabled, message])
}
