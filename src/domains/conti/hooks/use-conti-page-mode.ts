import { usePathname, useSearchParams } from 'next/navigation'

import { buildContiModeHref } from '@/domains/conti/utils/conti-editor'

export type ContiPageMode = 'view' | 'edit'

export function useContiPageMode(canEdit: boolean) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const requestedMode: ContiPageMode = searchParams.get('mode') === 'edit' ? 'edit' : 'view'
  const mode: ContiPageMode = canEdit && requestedMode === 'edit' ? 'edit' : 'view'

  const navigate = (nextMode: ContiPageMode, method: 'push' | 'replace') => {
    const href = buildContiModeHref(pathname, searchParams.toString(), nextMode)

    if (method === 'push') {
      window.history.pushState(null, '', href)
      return
    }
    window.history.replaceState(null, '', href)
  }

  return {
    mode,
    startEditing: () => navigate('edit', 'push'),
    closeEditor: () => navigate('view', 'replace'),
  }
}
