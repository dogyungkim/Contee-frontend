/**
 * Time constants for query configurations
 * Used to standardize staleTime, gcTime, and other time-based settings
 */
export const STALE_TIME = {
    MINUTE: 60 * 1000,
    FIVE_MINUTES: 5 * 60 * 1000,
    HOUR: 60 * 60 * 1000,
} as const;

export const GC_TIME = {
    FIVE_MINUTES: 5 * 60 * 1000,
    TEN_MINUTES: 10 * 60 * 1000,
    THIRTY_MINUTES: 30 * 60 * 1000,
} as const;
