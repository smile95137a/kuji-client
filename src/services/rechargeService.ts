// services/rechargeService.ts
import { api } from './FrontAPI';
import type { ApiResponse, PaginatedApiResponse } from '@/types/api';

const basePath = '/recharge';
const walletBasePath = '/wallet/recharge';

export type PaymentMethodCode = 'CREDIT_CARD' | 'BANK_TRANSFER';

export interface RechargeReq {
  planId: string;
  paymentMethod?: PaymentMethodCode;
}

export type RechargeStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface RechargeRes {
  id: string;
  planId: string;
  planName: string;
  amount: number;
  goldCoins: number;
  bonusCoins: number;
  status: RechargeStatus;
  paymentUrl: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface RechargeOrderRes {
  rechargeOrderId: string;
  payUrl: string | null;
  goldAmount: number;
  bonusAmount: number;
  priceTwd: number;
  status: string;
  expiredAt: string | null;
}

export interface RechargeHistoryRow {
  id: string;
  planId: string;
  planName?: string;
  amount: number;
  goldCoins: number;
  bonusCoins: number;
  paymentMethod: string;
  paymentStatus: RechargeStatus;
  transactionId: string;
  createdAt: string;
  paidAt?: string | null;
}

/**
 * 前台 - 建立儲值請求（測試模式：直接完成）
 * POST /api/recharge
 * ⚠️ 目前為測試模式：後端直接設為 COMPLETED，金幣立即到帳，paymentUrl = null
 */
export const createRechargeRequest = async (
  req: RechargeReq,
): Promise<ApiResponse<RechargeRes>> => {
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
}): Promise<PaginatedApiResponse<RechargeHistoryRow>> => {
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
/**
 * 前台 - 查詢可用支付方式 GET /api/recharge/payment-methods（公開，不需 Token）
 */
export const getPaymentMethods = async (): Promise<ApiResponse<any[]>> => {
  try {
    const res = await api.get(`${basePath}/payment-methods`);
    return res.data;
  } catch (e) {
    console.error('Recharge - getPaymentMethods error:', e);
    throw e;
  }
};

export const createWalletRechargeOrder = async (
  req: RechargeReq,
): Promise<ApiResponse<RechargeOrderRes>> => {
  try {
    const res = await api.post(`${walletBasePath}`, req ?? null);
    return res.data;
  } catch (e) {
    console.error('Recharge - createWalletRechargeOrder error:', e);
    throw e;
  }
};

export const getRechargeOrder = async (
  rechargeOrderId: string,
): Promise<ApiResponse<RechargeOrderRes>> => {
  try {
    const res = await api.get(`${walletBasePath}/${rechargeOrderId}`);
    return res.data;
  } catch (e) {
    console.error('Recharge - getRechargeOrder error:', e);
    throw e;
  }
};

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
