/// <reference types="vite/client" />
interface ApiResponse<T> {
  code: string;
  message: string;
  success: boolean;
  data: T;
}
interface SelectOption {
  value: string;
  label: string;
}
