'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

import { maskAnalyticsPath } from '@/lib/analytics'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

type GoogleAnalyticsPageViewProps = {
  measurementId: string
}

function sendGtag(...args: unknown[]) {
  window.dataLayer = window.dataLayer ?? []

  if (typeof window.gtag === 'function') {
    window.gtag(...args)
    return
  }

  window.gtag = (...queuedArgs: unknown[]) => {
    window.dataLayer = window.dataLayer ?? []
    window.dataLayer.push(queuedArgs)
  }
  window.gtag(...args)
}

export function GoogleAnalyticsPageView({
  measurementId,
}: GoogleAnalyticsPageViewProps) {
  const pathname = usePathname()
  const lastTrackedPathname = useRef<string | null>(null)

  useEffect(() => {
    if (!pathname || lastTrackedPathname.current === pathname) {
      return
    }

    lastTrackedPathname.current = pathname

    const pagePath = maskAnalyticsPath(pathname)

    sendGtag('event', 'page_view', {
      page_title: document.title,
      page_location: `${window.location.origin}${pagePath}`,
      page_path: pagePath,
      send_to: measurementId,
    })
  }, [measurementId, pathname])

  return null
}
