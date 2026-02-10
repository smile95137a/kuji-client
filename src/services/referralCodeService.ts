// services/referralCodeService.ts
import { api } from './FrontAPI';

const basePath = '/referral-code';

interface RequestData {
  [key: string]: any;
}

/** 前台 - 驗證推薦碼 GET /referral-code/validate/{code} */
export const validateReferralCode = async (
  code: string
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}/validate/${encodeURIComponent(code)}`);
    return res.data;
  } catch (e) {
    console.error('ReferralCode - validateReferralCode error:', e);
    throw e;
  }
};

/** 前台 - 取得推薦碼資訊 GET /referral-code/info/{code} */
export const getReferralCodeInfo = async (
  code: string,
  req?: RequestData
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}/info/${encodeURIComponent(code)}`, {
      params: req ?? undefined,
    });
    return res.data;
  } catch (e) {
    console.error('ReferralCode - getReferralCodeInfo error:', e);
    throw e;
  }
};
