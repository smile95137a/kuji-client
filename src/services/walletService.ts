// services/walletService.ts
import { api } from './FrontAPI';

const basePath = '/wallet'; // Bug Fix #3: removed extra /api prefix (FrontAPI baseURL already includes /api)

export interface WalletRes {
  userId: string;
  goldBalance: number;
  bonusBalance: number;
  totalRecharge: number;
  updatedAt: string;
}

export type WalletTransactionType =
  | 'RECHARGE'
  | 'DRAW_GOLD'
  | 'DRAW_BONUS'
  | 'RECYCLE_BONUS'
  | 'REFERRAL_BONUS'
  | 'ADMIN_ADJUST'
  | 'EXPIRE';

export interface WalletTransactionQueryReq {
  condition?: {
    type?: WalletTransactionType;
    createdAtStart?: string;
    createdAtEnd?: string;
  };
  page?: number;
  size?: number;
  sortOrder?: 'ASC' | 'DESC';
}

export interface WalletTransactionRes {
  id: string;
  type: WalletTransactionType;
  coinType: 'GOLD' | 'BONUS';
  amount: number;
  balanceAfter: number;
  description: string;
  referenceId: string | null;
  createdAt: string;
}

/** 前台 - 查詢我的錢包 GET /api/wallet */
export const getMyWallet = async (): Promise<ApiResponse<WalletRes>> => {
  try {
    const res = await api.get(`${basePath}`);
    return res.data;
  } catch (e) {
    console.error('Wallet - getMyWallet error:', e);
    throw e;
  }
};

/** 前台 - 查詢我的交易記錄 POST /api/wallet/transactions */
export const getMyWalletTransactions = async (
  req?: WalletTransactionQueryReq
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.post(`${basePath}/transactions`, req ?? null);
    return res.data;
  } catch (e) {
    console.error('Wallet - getMyWalletTransactions error:', e);
    throw e;
  }
};
