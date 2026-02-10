// services/lotteryBrowseService.ts
import { api } from './FrontAPI';

const basePath = '/lottery/browse';

interface RequestData {
  [key: string]: any;
}

export const queryBrowseLotteries = async (
  req?: RequestData
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
  id: string
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}/${id}/detail`);
    return res.data;
  } catch (e) {
    console.error('LotteryBrowse - getBrowseLotteryById error:', e);
    throw e;
  }
};

/** 前台 - 取得商品詳情（完整版，含 prizes + tickets + session） */
export const getBrowseLotteryDetail = async (
  id: string
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}/${id}/detail`); // use /detail
    return res.data;
  } catch (e) {
    console.error('LotteryBrowse - getBrowseLotteryDetail error:', e);
    throw e;
  }
};

/**
 * 前台 - 增加商品熱度 POST /lottery/browse/{id}/hot
 */
export const incrementHotCount = async (
  id: string
): Promise<ApiResponse<number>> => {
  try {
    const res = await api.post(`${basePath}/${id}/hot`);
    return res.data;
  } catch (e) {
    console.error('LotteryBrowse - incrementHotCount error:', e);
    throw e;
  }
}

/** 前台 - 查詢店家商品列表 */
export const getBrowseLotteriesByStore = async (
  storeId: string,
  req?: RequestData
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}/store/${storeId}`, {
      params: req ?? undefined,
    });
    return res.data;
  } catch (e) {
    console.error('LotteryBrowse - getBrowseLotteriesByStore error:', e);
    throw e;
  }
};
