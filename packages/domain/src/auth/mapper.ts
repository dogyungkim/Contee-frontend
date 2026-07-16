import type { AuthResponse, User } from './model'
import type { AuthResponseDto, UserDto } from './dto'

export const toUserModel = (dto: UserDto): User => ({
  id: dto.id,
  email: dto.email,
  name: dto.name,
  profileImageUrl: dto.profileImageUrl,
  provider: dto.provider,
})

export const toAuthResponseModel = (dto: AuthResponseDto): AuthResponse => ({
  accessToken: dto.accessToken,
  user: toUserModel(dto.user),
})
