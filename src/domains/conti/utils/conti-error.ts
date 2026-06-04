import { AxiosError } from 'axios';

interface ApiErrorBody {
  message?: string;
  error?: string;
}

export function getContiApiErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorBody | undefined;
    return data?.message || data?.error || fallbackMessage;
  }

  if (error instanceof Error) {
    return error.message || fallbackMessage;
  }

  return fallbackMessage;
}
