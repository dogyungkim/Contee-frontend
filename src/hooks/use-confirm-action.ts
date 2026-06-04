'use client';

export function useConfirmAction() {
  const confirmAction = async (message: string): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    return window.confirm(message);
  };

  return { confirmAction };
}
