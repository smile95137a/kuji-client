// services/rechargeService.ts
import { api } from './FrontAPI';

const basePath = '/recharge';

interface RequestData {
  [key: string]: any;
}

/**
 * 建立儲值請求 POST /api/recharge
 * 
 * @param payload - { planId: string, paymentMethod: 'ECPAY'|'OPAY'|'CREDIT_CARD', remark?: string }
 * @returns 儲值記錄（狀態為 PENDING）
 */
export const createRecharge = async (payload: {
  planId: string;
  paymentMethod: 'ECPAY' | 'OPAY' | 'CREDIT_CARD';
  remark?: string;
}): Promise<ApiResponse<any>> => {
  try {
    const res = await api.post(`${basePath}`, payload);
    return res.data;
  } catch (e) {
    console.error('Recharge - createRecharge error:', e);
    throw e;
  }
};

/**
 * 確認支付成功 POST /api/recharge/{rechargeId}/confirm
 * 
 * @param rechargeId - 儲值記錄 ID
 * @param transactionId - 支付網關交易 ID（選填）
 * @returns 更新後的儲值記錄（狀態為 COMPLETED）
 */
export const confirmRecharge = async (
  rechargeId: string,
  transactionId?: string
): Promise<ApiResponse<any>> => {
  try {
    const params = transactionId ? { transactionId } : undefined;
    const res = await api.post(`${basePath}/${rechargeId}/confirm`, null, {
      params,
    });
    return res.data;
  } catch (e) {
    console.error('Recharge - confirmRecharge error:', e);
    throw e;
  }
};

/**
 * 記錄支付失敗 POST /api/recharge/{rechargeId}/failure
 * 
 * @param rechargeId - 儲值記錄 ID
 * @param failReason - 失敗原因（選填）
 * @returns 更新後的儲值記錄（狀態為 FAILED）
 */
export const failRecharge = async (
  rechargeId: string,
  failReason?: string
): Promise<ApiResponse<any>> => {
  try {
    const params = failReason ? { failReason } : undefined;
    const res = await api.post(`${basePath}/${rechargeId}/failure`, null, {
      params,
    });
    return res.data;
  } catch (e) {
    console.error('Recharge - failRecharge error:', e);
    throw e;
  }
};

/**
 * 查詢我的儲值記錄 GET /api/recharge/history
 * 
 * @param page - 頁碼（預設 1）
 * @param size - 每頁筆數（預設 10）
 * @returns 儲值記錄列表
 */
export const getMyRechargeHistory = async (
  page: number = 1,
  size: number = 10
): Promise<ApiResponse<any[]>> => {
  try {
    const res = await api.get(`${basePath}/history`, {
      params: { page, size },
    });
    return res.data;
  } catch (e) {
    console.error('Recharge - getMyRechargeHistory error:', e);
    throw e;
  }
};
