export const getPublicEnv = (key: string) => {
  switch (key) {
    case 'EXPO_PUBLIC_API_BASE_URL':
      return process.env.EXPO_PUBLIC_API_BASE_URL
    case 'EXPO_PUBLIC_API_LOG':
      return process.env.EXPO_PUBLIC_API_LOG
    case 'EXPO_PUBLIC_DEV_AUTH_BYPASS':
      return process.env.EXPO_PUBLIC_DEV_AUTH_BYPASS
    case 'EXPO_PUBLIC_DEV_ACCESS_TOKEN':
      return process.env.EXPO_PUBLIC_DEV_ACCESS_TOKEN
    case 'EXPO_PUBLIC_DEV_REFRESH_TOKEN':
      return process.env.EXPO_PUBLIC_DEV_REFRESH_TOKEN
    default:
      return undefined
  }
}

export const getPublicEnvFlag = (key: string) => getPublicEnv(key) === 'true'

export const hasPublicEnvValue = (key: string) =>
  Boolean(getPublicEnv(key)?.trim())
