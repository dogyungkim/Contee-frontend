export type ApiErrorKind =
  | 'network'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'rate_limited'
  | 'server'
  | 'client'
  | 'unknown'

export interface NormalizedApiError {
  kind: ApiErrorKind
  message: string
  status: number | null
  code: string | null
  retryable: boolean
}

const getOwnValue = (value: unknown, key: string) =>
  value && typeof value === 'object'
    ? Object.getOwnPropertyDescriptor(value, key)?.value
    : undefined

const getStatus = (error: unknown) => {
  const status = getOwnValue(getOwnValue(error, 'response'), 'status')
  return typeof status === 'number' ? status : null
}

const getCode = (error: unknown) => {
  const data = getOwnValue(getOwnValue(error, 'response'), 'data')
  const code = getOwnValue(data, 'code') ?? getOwnValue(data, 'errorCode')
  return typeof code === 'string' && code.trim() ? code.trim() : null
}

export const normalizeApiError = (error: unknown): NormalizedApiError => {
  const status = getStatus(error)
  const code = getCode(error)

  if (!status)
    return {
      kind: 'network',
      message: '네트워크 연결을 확인한 뒤 다시 시도해주세요.',
      status,
      code,
      retryable: true,
    }
  if (status === 401)
    return {
      kind: 'unauthorized',
      message: '로그인이 만료되었습니다. 다시 로그인해주세요.',
      status,
      code,
      retryable: false,
    }
  if (status === 403)
    return {
      kind: 'forbidden',
      message: '이 작업을 수행할 권한이 없습니다.',
      status,
      code,
      retryable: false,
    }
  if (status === 404)
    return {
      kind: 'not_found',
      message: '요청한 정보를 찾을 수 없습니다.',
      status,
      code,
      retryable: false,
    }
  if (status === 429)
    return {
      kind: 'rate_limited',
      message: '요청이 많습니다. 잠시 후 다시 시도해주세요.',
      status,
      code,
      retryable: true,
    }
  if (status >= 500)
    return {
      kind: 'server',
      message: '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
      status,
      code,
      retryable: true,
    }

  return {
    kind: 'client',
    message: '요청을 처리하지 못했습니다. 다시 시도해주세요.',
    status,
    code,
    retryable: false,
  }
}

export const getApiErrorMessage = (error: unknown) =>
  normalizeApiError(error).message
