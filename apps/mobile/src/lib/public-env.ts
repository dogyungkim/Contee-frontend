export const getPublicEnv = (key: string) =>
  (
    globalThis as typeof globalThis & {
      process?: { env?: Record<string, string | undefined> }
    }
  ).process?.env?.[key]

export const getPublicEnvFlag = (key: string) => getPublicEnv(key) === 'true'

export const hasPublicEnvValue = (key: string) =>
  Boolean(getPublicEnv(key)?.trim())
