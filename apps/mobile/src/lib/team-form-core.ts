export const TEAM_NAME_MAX_LENGTH = 100
export const TEAM_DESCRIPTION_MAX_LENGTH = 2000

export function normalizeTeamName(value: string) {
  return value.trim()
}

export function normalizeTeamDescription(value: string) {
  const description = value.trim()
  return description || undefined
}

export function normalizeInviteCode(value: string) {
  return value.trim().toUpperCase()
}

export function getCreateTeamInputError(input: {
  name: string
  description: string
}) {
  const name = normalizeTeamName(input.name)
  const description = normalizeTeamDescription(input.description)

  if (!name) return '팀 이름을 입력해 주세요.'
  if (name.length > TEAM_NAME_MAX_LENGTH) {
    return `팀 이름은 ${TEAM_NAME_MAX_LENGTH}자 이하로 입력해 주세요.`
  }
  if (description && description.length > TEAM_DESCRIPTION_MAX_LENGTH) {
    return `설명은 ${TEAM_DESCRIPTION_MAX_LENGTH}자 이하로 입력해 주세요.`
  }

  return null
}

export function getInviteCodeInputError(value: string) {
  return normalizeInviteCode(value) ? null : '초대 코드를 입력해 주세요.'
}
