// services/walletService.ts
import { api } from './FrontAPI';

const basePath = '/api/wallet';

interface RequestData {
  [key: string]: any;
}

/** 前台 - 查詢我的錢包 GET /api/wallet */
export const getMyWallet = async (
  req?: RequestData
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}`, {
      params: req ?? undefined,
    });
    return res.data;
  } catch (e) {
    console.error('Wallet - getMyWallet error:', e);
    throw e;
  }
};

/** 前台 - 查詢我的交易記錄 POST /api/wallet/transactions */
export const getMyWalletTransactions = async (
  req?: RequestData
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.post(`${basePath}/transactions`, req ?? null);
    return res.data;
  } catch (e) {
    console.error('Wallet - getMyWalletTransactions error:', e);
    throw e;
  }
};
