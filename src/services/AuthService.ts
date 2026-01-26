// services/authService.ts
import { api } from './FrontAPI';
import { loadState } from '@/utils/Localstorage';

const basePath = '/auth';

interface RequestData {
  [key: string]: any;
}

/** Token Utils */
export const getAuthToken = () => loadState<any>('kujiToken');
export const getRefreshToken = () => loadState<any>('refreshKujiToken');
export const getTokenType = () => loadState<any>('kujiTokenType') || 'Bearer';

/** 註冊 */
export const register = async (req: RequestData): Promise<ApiResponse<any>> => {
  try {
    const res = await api.post(`${basePath}/register`, req ?? undefined);
    return res.data;
  } catch (e) {
    console.error('Auth - register error:', e);
    throw e;
  }
};

/** 登入 */
export const login = async (req: RequestData): Promise<ApiResponse<any>> => {
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
  req: RequestData,
): Promise<ApiResponse<any>> => {
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
  req?: RequestData,
): Promise<ApiResponse<any>> => {
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
  req: RequestData,
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
  req: RequestData,
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.post(`${basePath}/reset-password`, req ?? undefined);
    return res.data;
  } catch (e) {
    console.error('Auth - resetPassword error:', e);
    throw e;
  }
};
