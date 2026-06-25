export const PERIODS = [
  { label: '오전', value: 'AM' },
  { label: '오후', value: 'PM' },
] as const

export const HOURS = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'))
export const MINUTES = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'))

export interface WorshipTimeParts {
  period: string
  hour: string
  minute: string
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
    parts.period === 'AM'
      ? parsedHour % 12
      : parsedHour % 12 + 12

  return `${String(hour24).padStart(2, '0')}:${String(parsedMinute).padStart(2, '0')}`
}

export function normalizeWorshipTime(value?: string | null): string {
  if (!value) return ''

  const match = value.match(/^(\d{2}):(\d{2})(?::\d{2})?$/)
  if (!match) return value

  return `${match[1]}:${match[2]}`
}
