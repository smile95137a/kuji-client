// services/rechargeService.ts
import { api } from './FrontAPI';

const basePath = '/recharge';

interface RequestData {
  [key: string]: any;
}

/**
 * 前台 - 建立儲值請求（測試模式：直接完成）
 * POST /api/recharge
 * req: RechargeReq
 *  - planId: string
 *  - paymentMethod?: string (如果你有)
 *  - ...其他欄位依後端 RechargeReq
 */
export const createRechargeRequest = async (
  req: RequestData,
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.post(`${basePath}`, req ?? null);
    return res.data;
  } catch (e) {
    console.error('Recharge - createRechargeRequest error:', e);
    throw e;
  }
};

/**
 * 前台 - 查詢我的儲值記錄 GET /api/recharge/history?page=&size=
 * 注意：後端是 GET + query params（不是 POST）
 */
export const getMyRechargeHistory = async (req?: {
  page?: number;
  size?: number;
}): Promise<ApiResponse<any>> => {
  try {
    const params = {
      page: req?.page ?? 1,
      size: req?.size ?? 10,
    };
    const res = await api.get(`${basePath}/history`, { params });
    return res.data;
  } catch (e) {
    console.error('Recharge - getMyRechargeHistory error:', e);
    throw e;
  }
};

/**
 * 前台 - 確認支付（模擬/回調）
 * POST /api/recharge/{rechargeId}/confirm?transactionId=xxx
 */
export const confirmRechargePayment = async (
  rechargeId: string,
  transactionId?: string,
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.post(`${basePath}/${rechargeId}/confirm`, null, {
      params: { transactionId },
    });
    return res.data;
  } catch (e) {
    console.error('Recharge - confirmRechargePayment error:', e);
    throw e;
  }
};

/**
 * 前台 - 記錄支付失敗/取消
 * POST /api/recharge/{rechargeId}/failure?failReason=xxx
 */
export const recordRechargePaymentFailure = async (
  rechargeId: string,
  failReason?: string,
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.post(`${basePath}/${rechargeId}/failure`, null, {
      params: { failReason },
    });
    return res.data;
  } catch (e) {
    console.error('Recharge - recordRechargePaymentFailure error:', e);
    throw e;
  }
};
