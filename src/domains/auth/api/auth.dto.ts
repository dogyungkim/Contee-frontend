export interface UserDto {
  id: string;
  email: string;
  name: string;
  profileImageUrl: string;
  provider: string;
}

export interface AuthResponseDto {
  accessToken: string;
  user: UserDto;
}
