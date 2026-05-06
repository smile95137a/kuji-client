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
  page: number;
  size: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  data: T[];
}

/** Standard wrapper for paginated API responses */
export type PaginatedApiResponse<T> = ApiResponse<PageResult<T>>;
