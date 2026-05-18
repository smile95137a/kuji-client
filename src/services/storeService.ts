// src/services/storeService.ts
import { api } from './FrontAPI';

const basePath = '/stores';

interface RequestData {
  [key: string]: any;
}

/** 前台 - 取得店家列表 GET /stores */
export const getStores = async (
  req?: RequestData,
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}`, {
      params: req ?? { page: 1, size: 100 },
    });

    return res.data;
  } catch (e) {
    console.error('Store - getStores error:', e);
    throw e;
  }
};

/** 前台 - 取得店家詳情 GET /stores/{id} */
export const getStoreDetail = async (
  id: string,
  req?: RequestData,
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}/${id}`, {
      params: req ?? undefined,
    });

    return res.data;
  } catch (e) {
    console.error('Store - getStoreDetail error:', e);
    throw e;
  }
};

/** 前台 - 取得店家商品列表 GET /stores/{id}/products */
export const getStoreProducts = async (
  id: string,
  req?: RequestData,
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}/${id}/products`, {
      params: req ?? undefined,
    });

    return res.data;
  } catch (e) {
    console.error('Store - getStoreProducts error:', e);
    throw e;
  }
};
