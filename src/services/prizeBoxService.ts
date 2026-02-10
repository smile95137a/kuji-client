// services/prizeBoxService.ts
import { api } from './FrontAPI';

const basePath = '/prize-box';

interface RequestData {
  [key: string]: any;
}

/** 前台 - 查詢我的賞品盒 GET /api/prize-box */
export const getMyPrizeBox = async (
  req?: RequestData
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}`, {
      params: req ?? undefined,
    });
    return res.data;
  } catch (e) {
    console.error('PrizeBox - getMyPrizeBox error:', e);
    throw e;
  }
};

/** 前台 - 按店家分組查詢賞品盒（用於出貨選擇） GET /api/prize-box/summary */
export const getPrizeBoxSummaryByStore = async (
  req?: RequestData
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}/summary`, {
      params: req ?? undefined,
    });
    return res.data;
  } catch (e) {
    console.error('PrizeBox - getPrizeBoxSummaryByStore error:', e);
    throw e;
  }
};

/**
 * 前台 - 出貨（將選定獎品產生訂單） POST /prize-box/ship
 *
 * ⚠️ 2026-02-08 更新：不再使用 addressId，改傳完整配送資訊
 *
 * 宅配模式：
 *   { prizeBoxIds, shippingMethod: 'HOME_DELIVERY', recipientName, recipientPhone, recipientAddress, remark? }
 *
 * 超商取貨模式：
 *   { prizeBoxIds, shippingMethod: 'SEVEN_ELEVEN'|'FAMILY_MART', recipientName, recipientPhone, storeCode, storeName, storeAddress }
 */
export const shipPrizes = async (payload: {
  prizeBoxIds: string[];
  shippingMethod: 'HOME_DELIVERY' | 'SEVEN_ELEVEN' | 'FAMILY_MART';
  recipientName: string;
  recipientPhone: string;
  recipientAddress?: string;
  storeCode?: string;
  storeName?: string;
  storeAddress?: string;
  remark?: string;
}): Promise<ApiResponse<any>> => {
  try {
    const res = await api.post(`${basePath}/ship`, payload);
    return res.data;
  } catch (e) {
    console.error('PrizeBox - shipPrizes error:', e);
    throw e;
  }
};

/** 前台 - 回收獎品（轉換為紅利） POST /api/prize-box/recycle */
export const recyclePrizes = async (payload: {
  prizeBoxIds: string[];
}): Promise<ApiResponse<any>> => {
  try {
    const res = await api.post(`${basePath}/recycle`, payload);
    return res.data;
  } catch (e) {
    console.error('PrizeBox - recyclePrizes error:', e);
    throw e;
  }
};
