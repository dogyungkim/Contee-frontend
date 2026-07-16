export const PERIODS = [
  { label: '오전', value: 'AM' },
  { label: '오후', value: 'PM' },
] as const

export const HOURS = Array.from({ length: 12 }, (_, i) =>
  (i + 1).toString().padStart(2, '0')
)

export const MINUTES = Array.from({ length: 12 }, (_, i) =>
  (i * 5).toString().padStart(2, '0')
)

export interface WorshipTimeParts {
  period: string
  hour: string
  minute: string
}

export function normalizeWorshipTime(value?: string | null): string {
  if (!value) return ''

  const localizedMatch = value
    .trim()
    .match(/^(오전|오후|AM|PM)\s*(\d{1,2}):(\d{2})(?::\d{2})?$/i)

  if (localizedMatch) {
    const [, rawPeriod, rawHour, rawMinute] = localizedMatch
    if (!rawPeriod || !rawHour || !rawMinute) return ''

    const hour = Number(rawHour)
    const minute = Number(rawMinute)

    if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return ''

    const isPm = rawPeriod === '오후' || rawPeriod.toUpperCase() === 'PM'
    const hour24 = isPm ? (hour % 12) + 12 : hour % 12
    return `${String(hour24).padStart(2, '0')}:${rawMinute}`
  }

  const timeMatch = value.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/)
  if (!timeMatch) return ''

  const [, rawHour, rawMinute] = timeMatch
  if (!rawHour || !rawMinute) return ''

  const hour = Number(rawHour)
  const minute = Number(rawMinute)
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return ''

  return `${String(hour).padStart(2, '0')}:${rawMinute}`
}

export function parseWorshipTime(value?: string | null): WorshipTimeParts {
  const normalizedValue = normalizeWorshipTime(value)

  if (!normalizedValue) {
    return {
      period: 'AM',
      hour: '10',
      minute: '00',
    }
  }

  const [rawHour, minute] = normalizedValue.split(':').map(Number)
  if (rawHour === undefined || minute === undefined) {
    return {
      period: 'AM',
      hour: '10',
      minute: '00',
    }
  }

  const period = rawHour >= 12 ? 'PM' : 'AM'
  const normalizedHour = rawHour % 12 || 12

  return {
    period,
    hour: String(normalizedHour).padStart(2, '0'),
    minute: String(minute).padStart(2, '0'),
  }
}

export function formatWorshipTime(parts: WorshipTimeParts): string {
  const parsedHour = Number(parts.hour)
  const parsedMinute = Number(parts.minute)

  const hour24 =
    parts.period === 'AM' ? parsedHour % 12 : (parsedHour % 12) + 12

  return `${String(hour24).padStart(2, '0')}:${String(parsedMinute).padStart(
    2,
    '0'
  )}`
}
