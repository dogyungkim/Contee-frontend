// Shared API envelope and transport-level types.

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PageDto<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
}
