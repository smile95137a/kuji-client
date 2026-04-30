// services/prizeBoxService.ts
import { api } from './FrontAPI';

const basePath = '/prize-box';

interface RequestData {
  [key: string]: any;
}

/** 出貨請求（同一家店的獎品） */
export interface PrizeBoxShipReq {
  prizeBoxIds: string[];
  shippingMethod: string;
  shippingMethodId?: string | null;
  shippingFee?: number | null;
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
  paymentUrl: string | null;
  gatewayTradeNo: string | null;
}

/** 賞品盒單筆獎品 */
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
  status: 'IN_BOX' | 'SHIPPING' | 'DELIVERED' | 'REDEEMED';
  statusName: string;
  isRecyclable: boolean;
  recycleBonus: number;
  createdAt: string;
}

/** 前台 - 查詢我的賞品盒 GET /api/prize-box */
export const getMyPrizeBox = async (): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}`);
    return res.data;
  } catch (e) {
    console.error('PrizeBox - getMyPrizeBox error:', e);
    throw e;
  }
};

/** 前台 - 按店家分組查詢賞品盒 GET /api/prize-box/summary */
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
 * 前台 - 出貨（將選定的獎品產生訂單）
 * POST /api/prize-box/ship
 * req: { prizeBoxIds: string[], ...其他欄位依 PrizeBoxShipReq }
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
 * 前台 - 回收獎品（轉換為紅利）
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
 * 前台 - 查詢賞品盒操作紀錄 GET /prize-box/history
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
