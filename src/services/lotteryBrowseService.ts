// services/lotteryBrowseService.ts
import { api } from './FrontAPI';

const basePath = '/lottery/browse';

interface RequestData {
  [key: string]: any;
}

/**
 * 商品瀏覽查詢條件
 */
export interface BrowseCondition {
  /** 商品狀態 */
  status?: 'ON_SHELF' | 'OFF_SHELF' | 'SOLD_OUT';
  /** 主題名稱 */
  theme?: string;
  /** 類別 */
  category?: string;
  /** 標籤（可多個） */
  tags?: string[];
}

export interface BrowseQueryReq {
  condition?: BrowseCondition;
  page?: number;
  size?: number;
}

export const queryBrowseLotteries = async (
  req?: BrowseQueryReq,
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.post(`${basePath}/list`, req ?? undefined);
    return res.data;
  } catch (e) {
    console.error('LotteryBrowse - queryBrowseLotteries error:', e);
    throw e;
  }
};

export const getBrowseLotteryById = async (
  id: string,
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}/${id}/detail`);
    return res.data;
  } catch (e) {
    console.error('LotteryBrowse - getBrowseLotteryById error:', e);
    throw e;
  }
};

export const getBrowseLotteriesByStore = async (
  storeId: string,
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}/store/${storeId}`);
    return res.data;
  } catch (e) {
    console.error('LotteryBrowse - getBrowseLotteriesByStore error:', e);
    throw e;
  }
};

export const incrementLotteryHotCount = async (
  id: string,
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.post(`${basePath}/${id}/hot`);
    return res.data;
  } catch (e) {
    console.error('LotteryBrowse - incrementLotteryHotCount error:', e);
    throw e;
  }
};
