// services/prizeBoxService.ts
import { api } from './FrontAPI';
import type { ApiResponse, PaginatedApiResponse } from '@/types/api';

const basePath = '/prize-box';

interface RequestData {
  [key: string]: any;
}

/** ?箄疏隢?嚗?銝摰嗅????? */
export interface PrizeBoxShipReq {
  prizeBoxIds: string[];
  shippingMethod: string;
  shippingMethodId?: string | null;
  shippingFee?: number | null;
  paymentMethod?: 'CREDIT_CARD' | 'BANK_TRANSFER' | null;
  recipientName: string;
  recipientPhone: string;
  recipientAddress?: string | null;
  storeCode?: string | null;
  storeName?: string | null;
  storeAddress?: string | null;
  remark?: string | null;
  userAddressId?: string | null;
}

export interface ShipOrderResult {
  orderId: string;
  orderNumber: string;
  shippingFee: number;
  paymentStatus: string;
  paymentMethod?: string | null;
  paymentUrl: string | null;
  submitMethod?: string | null;
  actionUrl?: string | null;
  formFields?: Record<string, string> | null;
  gatewayTradeNo: string | null;
  gatewayResult?: string | null;
  retMsg?: string | null;
  virtualAccount?: string | null;
  payInfo?: string | null;
  limitDate?: string | null;
}

/** 鞈??蝑???*/
export interface PrizeBoxItemRes {
  id: string;
  userId: string;
  lotteryId: string;
  lotteryTitle: string;
  prizeId: string;
  prizeName: string;
  prizeLevel: string;
  prizeImageUrl: string;
  storeId: string;
  storeName: string;
  status: 'IN_BOX' | 'SHIPPING' | 'SHIPPED' | 'RECYCLED';
  statusName: string;
  isRecyclable: boolean;
  recycleBonus: number;
  createdAt: string;
}

/** ? - ?亥岷??鞈???GET /api/prize-box */
export const getMyPrizeBox = async (): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}`);
    return res.data;
  } catch (e) {
    console.error('PrizeBox - getMyPrizeBox error:', e);
    throw e;
  }
};

/** ? - ??摰嗅?蝯閰Ｚ??? GET /api/prize-box/summary */
export const getPrizeBoxSummaryByStore = async (): Promise<
  ApiResponse<any>
> => {
  try {
    const res = await api.get(`${basePath}/summary`);
    return res.data;
  } catch (e) {
    console.error('PrizeBox - getPrizeBoxSummaryByStore error:', e);
    throw e;
  }
};

/**
 * ? - ?箄疏嚗??詨???????殷?
 * POST /api/prize-box/ship
 * req: { prizeBoxIds: string[], ...?嗡?甈?靘?PrizeBoxShipReq }
 */
export const shipPrizeBoxItems = async (
  req: PrizeBoxShipReq,
): Promise<ApiResponse<ShipOrderResult[]>> => {
  try {
    const res = await api.post(`${basePath}/ship`, req ?? null);
    return res.data;
  } catch (e) {
    console.error('PrizeBox - shipPrizeBoxItems error:', e);
    throw e;
  }
};

/**
 * ? - ???嚗??蝝嚗?
 * POST /api/prize-box/recycle
 * req: { prizeBoxIds: string[] }
 */
export const recyclePrizeBoxItems = async (
  req: RequestData,
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.post(`${basePath}/recycle`, req ?? null);
    return res.data;
  } catch (e) {
    console.error('PrizeBox - recyclePrizeBoxItems error:', e);
    throw e;
  }
};

/**
 * ? - ?亥岷鞈???雿???GET /prize-box/history
 */
export const getPrizeBoxHistory = async (
  req?: RequestData,
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}/history`, { params: req });
    return res.data;
  } catch (e) {
    console.error('PrizeBox - getPrizeBoxHistory error:', e);
    throw e;
  }
};

