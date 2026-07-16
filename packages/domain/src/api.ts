export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PageDto<T> {
  content: T[]
  totalPages: number
  totalElements: number
  number?: number
  size?: number
  numberOfElements?: number
  first?: boolean
  last?: boolean
}
