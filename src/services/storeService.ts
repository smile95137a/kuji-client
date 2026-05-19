// src/services/storeService.ts
import { api } from './FrontAPI';

const basePath = '/stores';

interface RequestData {
  [key: string]: any;
}

export type StoreBusinessHoursStructuredDay =
  | 'MON'
  | 'TUE'
  | 'WED'
  | 'THU'
  | 'FRI'
  | 'SAT'
  | 'SUN';

export interface StoreBusinessHoursStructuredSchedule {
  day: StoreBusinessHoursStructuredDay;
  open?: string | null;
  close?: string | null;
  closed?: boolean | null;
}

export interface StoreBusinessHoursStructuredException {
  date?: string | null;
  closed?: boolean | null;
  open?: string | null;
  close?: string | null;
}

export interface StoreBusinessHoursStructured {
  schedules: StoreBusinessHoursStructuredSchedule[];
  exceptions?: StoreBusinessHoursStructuredException[] | null;
  tz?: string | null;
}

export interface StoreBusinessHoursDay {
  isClosed?: boolean | null;
  open?: string | null;
  close?: string | null;
}

export type StoreBusinessHours =
  | string
  | null
  | undefined
  | StoreBusinessHoursStructured
  | Record<string, StoreBusinessHoursDay>;

export interface Store {
  id: string;
  storeName: string;
  name?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  coverImages?: string[] | null;
  address?: string | null;
  isActive?: boolean | null;
  businessHours?: StoreBusinessHours;
}

export interface StoreProduct {
  id: string;
  title?: string | null;
  imageUrl?: string | null;
  bannerImageUrl?: string | null;
  category?: string | null;
  subCategory?: string | null;
  playMode?: string | null;
  pricePerDraw?: number | null;
  maxDraws?: number | null;
  status?: string | null;
}

export interface StoreDetail extends Store {
  longDescription?: string | null;
  email?: string | null;
  phone?: string | null;
  businessHoursStructured?: StoreBusinessHoursStructured | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  lineId?: string | null;
  products?: StoreProduct[] | null;
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
