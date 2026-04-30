// services/shippingMethodService.ts
import { api } from './FrontAPI';

export interface ShippingMethod {
  id: string;
  code: string;
  name: string;
  provider?: string | null;
  fee: number;
  status: string;
  sortOrder?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

/** 前台 - 查詢可用配送方式 GET /api/shipping-methods */
export const getShippingMethods = async (): Promise<ShippingMethod[]> => {
  try {
    const res = await api.get('/shipping-methods');
    const data = res.data;
    const list = Array.isArray(data) ? data : (data?.data ?? []);
    return (list as ShippingMethod[])
      .filter((m) => String(m?.status ?? '').toUpperCase() === 'ACTIVE')
      .sort((a, b) => Number(a?.sortOrder ?? 0) - Number(b?.sortOrder ?? 0));
  } catch (e) {
    console.error('ShippingMethod - getShippingMethods error:', e);
    throw e;
  }
};
