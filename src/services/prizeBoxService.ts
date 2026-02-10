// services/prizeBoxService.ts
import { api } from './FrontAPI';

const basePath = '/prize-box';

interface RequestData {
  [key: string]: any;
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
  req: RequestData,
): Promise<ApiResponse<any>> => {
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
