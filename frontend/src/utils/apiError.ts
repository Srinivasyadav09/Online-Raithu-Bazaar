import axios from "axios";

interface ApiErrorBody {
  detail?: string;
  message?: string;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const detail = error.response?.data?.detail ?? error.response?.data?.message;
    if (typeof detail === "string" && detail.trim()) return detail;
  }

  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}
