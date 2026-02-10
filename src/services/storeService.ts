// services/storeService.ts
import { api } from './FrontAPI';

const basePath = '/stores';

interface RequestData {
  [key: string]: any;
}

/** 前台 - 取得店家選項列表 GET /stores/options */
export const getStoreOptions = async (
  req?: RequestData
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}/options`, {
      params: req ?? undefined,
    });
    return res.data;
  } catch (e) {
    console.error('Store - getStoreOptions error:', e);
    throw e;
  }
};
