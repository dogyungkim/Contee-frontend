export function normalizeContiMetadata(input: {
  title: string
  worshipDate: string
  worshipTime: string
}) {
  return {
    title: input.title.trim(),
    worshipDate: input.worshipDate.trim(),
    worshipTime: input.worshipTime.trim(),
  }
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return (
    !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
  )
}

export function getContiMetadataInputError(input: {
  title: string
  worshipDate: string
  worshipTime: string
}) {
  const metadata = normalizeContiMetadata(input)

  if (!metadata.title) return '콘티 제목을 입력해 주세요.'
  if (!isValidDate(metadata.worshipDate)) {
    return '예배 날짜를 YYYY-MM-DD 형식으로 입력해 주세요.'
  }
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(metadata.worshipTime)) {
    return '예배 시간을 HH:mm 형식으로 입력해 주세요.'
  }

  return null
}
