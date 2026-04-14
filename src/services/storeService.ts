// src/services/storeService.ts
import { api } from './FrontAPI';

const basePath = '/stores';

export interface Store {
  id: string;
  name: string;
  description?: string;
  coverImages?: string[];
  logoUrl?: string;
  businessHours?: Record<string, { open: string; close: string; isClosed: boolean }>;
  address?: string;
  phone?: string;
  isActive: boolean;
}

export interface StoreDetail extends Store {
  products?: any[];
}

export const getStores = async (): Promise<ApiResponse<Store[]>> => {
  try {
    const res = await api.get(`${basePath}/list`);
    return res.data;
  } catch (e) {
    console.error('Store - getStores error:', e);
    throw e;
  }
};

export const getStoreDetail = async (id: string): Promise<ApiResponse<StoreDetail>> => {
  try {
    const res = await api.get(`${basePath}/${id}`);
    return res.data;
  } catch (e) {
    console.error('Store - getStoreDetail error:', e);
    throw e;
  }
};

export const getStoreProducts = async (id: string): Promise<ApiResponse<any[]>> => {
  try {
    const res = await api.get(`${basePath}/${id}/products`);
    return res.data;
  } catch (e) {
    console.error('Store - getStoreProducts error:', e);
    throw e;
  }
};
