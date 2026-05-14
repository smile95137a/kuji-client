import { api } from './FrontAPI';
import { loadState } from '@/utils/Localstorage';
import { useAuthStore } from '@/stores/useAuthStore';

const basePath = '/auth';

export interface AuthUserRes {
  id: string;
  email: string;
  nickname: string;
  avatarUrl?: string | null;
  avatar?: string | null;
  provider: 'EMAIL' | 'GOOGLE';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  goldCoins: number;
  bonusCoins: number;
  referralCode: string | null;
  createdAt: string;
}

export interface AuthRes {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: 'Bearer';
  forceChangePassword?: boolean;
  user?: AuthUserRes;
}

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

export interface VerifyEmailCodeReq {
  email: string;
  code: string;
}

export const getAuthToken = () => useAuthStore().token;
export const getRefreshToken = () => loadState<string>('refreshKujiToken') || '';
export const getTokenType = () => useAuthStore().tokenType || 'Bearer';

export const register = async (req: AuthRegisterReq): Promise<ApiResponse<AuthRes>> => {
  try {
    const res = await api.post(`${basePath}/register`, req ?? undefined);
    return res.data;
  } catch (e) {
    console.error('Auth - register error:', e);
    throw e;
  }
};

export const login = async (req: AuthLoginReq): Promise<ApiResponse<AuthRes>> => {
  try {
    const res = await api.post(`${basePath}/login`, req ?? undefined);
    return res.data;
  } catch (e) {
    console.error('Auth - login error:', e);
    throw e;
  }
};

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

export const getGoogleOAuthAuthorizationUrl = (): string =>
  `${import.meta.env.VITE_BASE_API_URL}/api/oauth2/authorization/google`;

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

export const logoutApi = async (): Promise<void> => {
  try {
    await api.post(`${basePath}/logout`);
  } catch (e) {
    console.warn('Auth - logout API error (degraded):', e);
  }
};

export const verifyEmail = async (token: string): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}/verify-email`, { params: { token } });
    return res.data;
  } catch (e) {
    console.error('Auth - verifyEmail error:', e);
    throw e;
  }
};

export const verifyEmailCode = async (
  req: VerifyEmailCodeReq,
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.post(`${basePath}/verify-email/code`, req ?? undefined);
    return res.data;
  } catch (e) {
    console.error('Auth - verifyEmailCode error:', e);
    throw e;
  }
};

export const resendVerification = async (
  req?: { email?: string },
  accessToken?: string,
): Promise<ApiResponse<any>> => {
  try {
    const config =
      accessToken && !useAuthStore().token
        ? { headers: { Authorization: `Bearer ${accessToken}` } }
        : undefined;
    const res = await api.post(
      `${basePath}/resend-verification`,
      req ?? undefined,
      config,
    );
    return res.data;
  } catch (e) {
    console.error('Auth - resendVerification error:', e);
    throw e;
  }
};

export const validateReferralCode = async (
  code: string,
  signal?: AbortSignal,
): Promise<ApiResponse<{ isValid: boolean; ownerName?: string; errorCode?: string }>> => {
  try {
    const res = await api.post(`${basePath}/validate-referral`, {
      code,
    }, {
      signal,
    });
    return res.data;
  } catch (e: any) {
    if (e?.name === 'CanceledError' || e?.name === 'AbortError') throw e;
    console.error('Auth - validateReferralCode error:', e);
    throw e;
  }
};
