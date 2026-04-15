// src/types/api.ts
// Central API response type definitions

/** Standard API response wrapper used by all endpoints */
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message?: string;
  code?: string;
  error?: { code: string; message: string } | null;
  meta?: { timestamp: string; requestId: string };
}

/** Paginated result wrapper */
export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}
