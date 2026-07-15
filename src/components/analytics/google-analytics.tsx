import { Suspense } from 'react'
import Script from 'next/script'

import { GoogleAnalyticsPageView } from '@/components/analytics/google-analytics-page-view'

type GoogleAnalyticsProps = {
  measurementId?: string
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  if (process.env.NODE_ENV !== 'production' || !measurementId) {
    return null
  }

  const encodedMeasurementId = encodeURIComponent(measurementId)
  const serializedMeasurementId = JSON.stringify(measurementId)

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodedMeasurementId}`}
        strategy="afterInteractive"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          window.gtag = window.gtag || gtag;
          gtag('js', new Date());
          gtag('config', ${serializedMeasurementId}, { send_page_view: false });
        `,
        }}
      />
      <Suspense fallback={null}>
        <GoogleAnalyticsPageView measurementId={measurementId} />
      </Suspense>
    </>
  )
}
