export type ContiStatus = 'DRAFT' | 'CONFIRMED' | 'PUBLISHED' | 'ARCHIVED';

export const CONTI_STATUS_LABEL: Record<ContiStatus, string> = {
  DRAFT: '작성 중',
  CONFIRMED: '확정',
  PUBLISHED: '발행',
  ARCHIVED: '보관',
};

export const CONTI_STATUS_BADGE_CLASS: Record<ContiStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PUBLISHED: 'bg-emerald-100 text-emerald-700',
  ARCHIVED: 'bg-amber-100 text-amber-700',
};

export function normalizeContiStatus(status?: string | null): ContiStatus {
  if (status === 'CONFIRMED' || status === 'PUBLISHED' || status === 'ARCHIVED') {
    return status;
  }

  return 'DRAFT';
}

export function isContiEditableStatus(status?: string | null): boolean {
  return normalizeContiStatus(status) === 'DRAFT' || normalizeContiStatus(status) === 'CONFIRMED';
}

export function getNextContiStatus(status?: string | null): ContiStatus | null {
  const normalizedStatus = normalizeContiStatus(status);

  if (normalizedStatus === 'DRAFT' || normalizedStatus === 'CONFIRMED') {
    return 'PUBLISHED';
  }

  if (normalizedStatus === 'PUBLISHED') {
    return 'ARCHIVED';
  }

  return null;
}
