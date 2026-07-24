import type { ContiSearchParamsDto, PageDto } from '@contee/domain'

export const CONTI_PAGE_SIZE = 20

type ContiFilters = Pick<ContiSearchParamsDto, 'q' | 'from' | 'to'>

export function normalizeContiFilters(filters: ContiFilters): ContiFilters {
  return {
    q: filters.q?.trim() || undefined,
    from: filters.from?.trim() || undefined,
    to: filters.to?.trim() || undefined,
  }
}

export function getNextContiPage<T>(page: PageDto<T>) {
  if (page.last || !page.totalPages) return undefined

  const currentPage = page.number ?? 0
  return currentPage + 1 < page.totalPages ? currentPage + 1 : undefined
}
