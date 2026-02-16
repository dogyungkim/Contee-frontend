import type { AuthResponse, User } from '@/domains/auth/models/auth';
import type { AuthResponseDto, UserDto } from '@/domains/auth/api/auth.dto';

export const toUserModel = (dto: UserDto): User => ({
  id: dto.id,
  email: dto.email,
  name: dto.name,
  profileImageUrl: dto.profileImageUrl,
  provider: dto.provider,
});

export const toAuthResponseModel = (dto: AuthResponseDto): AuthResponse => ({
  accessToken: dto.accessToken,
  user: toUserModel(dto.user),
});
