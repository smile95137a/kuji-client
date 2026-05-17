import { api } from './FrontAPI';
import type { PaginatedApiResponse } from '@/types/api';

const consumptionBasePath = '/consumption-records';
const walletTransactionBasePath = '/wallet/transactions';

interface RequestData {
  [key: string]: any;
}

export interface ConsumptionRecordRow {
  id: string;
  type?: string;
  typeName?: string;
  transactionType?: string;
  transactionTypeName?: string;
  coinType?: 'GOLD' | 'BONUS';
  direction?: 'INCOME' | 'EXPENSE';
  amount?: number;
  goldAmount?: number;
  bonusAmount?: number;
  balanceAfter?: number;
  description?: string;
  lotteryId?: string | null;
  lotteryTitle?: string | null;
  drawIndex?: number | null;
  ticketNumber?: number | null;
  refundAmount?: number;
  referenceId?: string | null;
  relatedId?: string | null;
  createdAt?: string;
}

export const getMyConsumptionRecords = async (
  req?: RequestData,
): Promise<PaginatedApiResponse<ConsumptionRecordRow>> => {
  const res = await api.post(`${consumptionBasePath}/list`, req ?? null);
  return res.data;
};

export const getWalletTransactions = async (
  req?: RequestData,
): Promise<PaginatedApiResponse<ConsumptionRecordRow>> => {
  const res = await api.post(`${walletTransactionBasePath}/list`, req ?? null);
  return res.data;
};