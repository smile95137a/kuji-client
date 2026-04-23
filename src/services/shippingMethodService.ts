// services/shippingMethodService.ts
import { api } from './FrontAPI';

export interface ShippingMethod {
  id: string;
  code: string;
  name: string;
  description: string;
  fee: number;
  isActive: boolean;
}

/** 前台 - 查詢可用配送方式 GET /api/shipping-methods */
export const getShippingMethods = async (): Promise<ShippingMethod[]> => {
  try {
    const res = await api.get('/shipping-methods');
    const data = res.data;
    // 後端可能回傳裸陣列或包在 ApiResponse.data 內
    const list = Array.isArray(data) ? data : (data?.data ?? []);
    return (list as ShippingMethod[]).filter((m) => m.isActive !== false);
  } catch (e) {
    console.error('ShippingMethod - getShippingMethods error:', e);
    throw e;
  }
};
