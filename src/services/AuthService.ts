// services/authService.ts
import { api } from './FrontAPI';
import { loadState } from '@/utils/Localstorage';
import { useAuthStore } from '@/stores/useAuthStore';

const basePath = '/auth';

// ── Response types ──────────────────────────────────────────────

export interface AuthUserRes {
  id: string;
  email: string;
  nickname: string;
  avatarUrl: string | null;
  provider: 'EMAIL' | 'GOOGLE';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  goldCoins: number;
  bonusCoins: number;
  referralCode: string | null;
  createdAt: string;
}

export interface AuthRes {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
  user: AuthUserRes;
}

// ── Request types ────────────────────────────────────────────────

export interface AuthRegisterReq {
  email: string;
  password: string;
  confirmPassword: string;
  nickname?: string;
  referralCode?: string;
}

export interface AuthLoginReq {
  email: string;
  password: string;
}

export interface AuthGoogleReq {
  idToken: string;
}

export interface RefreshTokenReq {
  refreshToken: string;
}

export interface ForgotPasswordReq {
  email: string;
}

export interface ResetPasswordReq {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Token Utils
 * getAuthToken reads from Pinia store (memory-only, XSS-safe).
 * getRefreshToken reads from localStorage (only refresh token is persisted).
 */
export const getAuthToken = () => useAuthStore().token;
export const getRefreshToken = () => loadState<string>('refreshKujiToken') || '';
export const getTokenType = () => useAuthStore().tokenType || 'Bearer';

/** 註冊 */
export const register = async (req: AuthRegisterReq): Promise<ApiResponse<AuthRes>> => {
  try {
    const res = await api.post(`${basePath}/register`, req ?? undefined);
    return res.data;
  } catch (e) {
    console.error('Auth - register error:', e);
    throw e;
  }
};

/** 登入 */
export const login = async (req: AuthLoginReq): Promise<ApiResponse<AuthRes>> => {
  try {
    const res = await api.post(`${basePath}/login`, req ?? undefined);
    return res.data;
  } catch (e) {
    console.error('Auth - login error:', e);
    throw e;
  }
};

/** Google OAuth 登入（前端拿到 Google ID Token 後送出） */
export const loginWithGoogle = async (
  req: AuthGoogleReq,
): Promise<ApiResponse<AuthRes>> => {
  try {
    const res = await api.post(`${basePath}/google`, req ?? undefined);
    return res.data;
  } catch (e) {
    console.error('Auth - loginWithGoogle error:', e);
    throw e;
  }
};

/** 刷新 Token（refresh token 本身不用 access token） */
export const refreshToken = async (
  req?: RefreshTokenReq,
): Promise<ApiResponse<AuthRes>> => {
  try {
    const payload = req ?? { refreshToken: getRefreshToken() };
    const res = await api.post(`${basePath}/refresh`, payload ?? undefined);
    return res.data;
  } catch (e) {
    console.error('Auth - refreshToken error:', e);
    throw e;
  }
};

/** 忘記密碼（寄信） */
export const forgotPassword = async (
  req: ForgotPasswordReq,
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.post(`${basePath}/forgot-password`, req ?? undefined);
    return res.data;
  } catch (e) {
    console.error('Auth - forgotPassword error:', e);
    throw e;
  }
};

/** 重設密碼（用 token） */
export const resetPassword = async (
  req: ResetPasswordReq,
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.post(`${basePath}/reset-password`, req ?? undefined);
    return res.data;
  } catch (e) {
    console.error('Auth - resetPassword error:', e);
    throw e;
  }
};

/**
 * 驗證推薦碼是否有效。
 * 後端回傳 HTTP 200 + { isValid: boolean, ownerName?: string }。
 * 傳入 signal 可取消進行中的請求（AbortController）。
 */
export const validateReferralCode = async (
  code: string,
  signal?: AbortSignal,
): Promise<ApiResponse<{ isValid: boolean; ownerName?: string; errorCode?: string }>> => {
  try {
    const res = await api.get(`${basePath}/referral/validate`, {
      params: { code },
      signal,
    });
    return res.data;
  } catch (e: any) {
    if (e?.name === 'CanceledError' || e?.name === 'AbortError') throw e;
    console.error('Auth - validateReferralCode error:', e);
    throw e;
  }
};
