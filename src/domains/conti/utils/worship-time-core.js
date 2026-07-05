/**
 * @param {string | null | undefined} value
 */
export function normalizeWorshipTimeValue(value) {
  if (!value) return ''

  const localizedMatch = value.trim().match(/^(오전|오후|AM|PM)\s*(\d{1,2}):(\d{2})(?::\d{2})?$/i)
  if (localizedMatch) {
    const [, rawPeriod, rawHour, rawMinute] = localizedMatch
    const hour = Number(rawHour)
    const minute = Number(rawMinute)

    if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return ''

    const isPm = rawPeriod === '오후' || rawPeriod.toUpperCase() === 'PM'
    const hour24 = isPm ? (hour % 12) + 12 : hour % 12
    return `${String(hour24).padStart(2, '0')}:${rawMinute}`
  }

  const timeMatch = value.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/)
  if (!timeMatch) return ''

  const hour = Number(timeMatch[1])
  const minute = Number(timeMatch[2])
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return ''

  return `${String(hour).padStart(2, '0')}:${timeMatch[2]}`
}
