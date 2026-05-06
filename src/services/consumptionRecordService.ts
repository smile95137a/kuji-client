// services/consumptionRecordService.ts
import { api } from './FrontAPI';
import type { ApiResponse, PaginatedApiResponse } from '@/types/api';

const consumptionBasePath = '/consumption-records';
const walletTransactionBasePath = '/wallet/transactions';

interface RequestData {
  [key: string]: any;
}

export interface ConsumptionRecordRow {
  id: string;
  type: string;
  typeName?: string;
  coinType?: 'GOLD' | 'BONUS';
  amount?: number;
  goldAmount?: number;
  bonusAmount?: number;
  balanceAfter?: number;
  description?: string;
  lotteryId?: string | null;
  lotteryTitle?: string | null;
  referenceId?: string | null;
  createdAt?: string;
}

export const getMyConsumptionRecords = async (
  req?: RequestData,
): Promise<PaginatedApiResponse<ConsumptionRecordRow>> => {
  try {
    const res = await api.post(`${consumptionBasePath}/list`, req ?? null);
    return res.data;
  } catch (e) {
    console.error('ConsumptionRecord - getMyConsumptionRecords error:', e);
    throw e;
  }
};

export const getWalletTransactions = async (
  req?: RequestData,
): Promise<PaginatedApiResponse<ConsumptionRecordRow>> => {
  try {
    const res = await api.post(`${walletTransactionBasePath}/list`, req ?? null);
    return res.data;
  } catch (e) {
    console.error('WalletTransaction - getWalletTransactions error:', e);
    throw e;
  }
};
