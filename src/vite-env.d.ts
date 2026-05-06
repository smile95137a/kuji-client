/// <reference types="vite/client" />
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message?: string;
  code?: string;
  error?: { code: string; message: string } | null;
  meta?: { timestamp: string; requestId: string };
}
interface SelectOption {
  value: string;
  label: string;
}
