export interface UserDto {
  id: number;
  email: string;
  name: string;
  profileImageUrl: string;
  provider: string;
}

export interface AuthResponseDto {
  accessToken: string;
  user: UserDto;
}
