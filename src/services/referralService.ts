// src/services/referralService.ts
import { api } from './FrontAPI';

const basePath = '/referral';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ReferralCodeRes {
  id: string;
  code: string; // e.g. "KUJI-XXXX"
  userId: string;
  usedCount: number;
  maxUsage: number | null; // null = unlimited
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export interface ReferralValidateRes {
  valid: boolean;
  code: string;
  reason: 'CODE_NOT_FOUND' | 'CODE_DISABLED' | 'SELF_REFERRAL' | 'ALREADY_USED' | 'CODE_EXPIRED' | null;
  referrerNickname?: string;
  bonusForReferrer?: number;
  bonusForNew?: number;
}

export interface ReferralApplyRes {
  success: boolean;
  bonusEarned: number;
  referrerBonusEarned: number;
  newBonusBalance: number;
}

export interface ReferralStatsRes {
  totalReferrals: number;
  totalBonusEarned: number;
  recentReferrals: {
    nickname: string;
    joinedAt: string;
  }[];
}

// ─── API calls ───────────────────────────────────────────────────────────────

/** 產生自己的推薦碼（已有則回傳現有）POST /referral/generate */
export const generateMyCode = async (): Promise<ReferralCodeRes> => {
  const res = await api.post(`${basePath}/generate`);
  return res.data?.data;
};

/** 驗證推薦碼是否有效 GET /referral/validate?code=XXX */
export const validateCode = async (
  code: string,
  signal?: AbortSignal,
): Promise<ReferralValidateRes> => {
  const res = await api.get(`${basePath}/validate`, {
    params: { code },
    signal,
  });
  return res.data?.data;
};

/** 套用推薦碼（終生一次）POST /referral/apply */
export const applyCode = async (code: string): Promise<ReferralApplyRes> => {
  const res = await api.post(`${basePath}/apply`, { code });
  return res.data?.data;
};

/** 取得推薦統計 GET /referral/stats */
export const getMyStats = async (): Promise<ReferralStatsRes> => {
  const res = await api.get(`${basePath}/stats`);
  return res.data?.data;
};

/** 停用自己的推薦碼 POST /referral/{id}/disable */
export const disableCode = async (id: string): Promise<void> => {
  await api.post(`${basePath}/${id}/disable`);
};
