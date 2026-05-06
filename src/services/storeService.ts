// src/services/storeService.ts
import { api } from './FrontAPI';
import type { ApiResponse, PaginatedApiResponse } from '@/types/api';

const basePath = '/stores';

export interface StoreBusinessHoursDay {
  open: string;
  close: string;
  isClosed: boolean;
}

export type StoreBusinessHours =
  | Record<string, StoreBusinessHoursDay>
  | string
  | null;

export interface Store {
  id: string;
  name: string;
  description?: string;
  shortDescription?: string;
  longDescription?: string;
  coverImages?: string[];
  coverImageUrl?: string;
  logoUrl?: string;
  businessHours?: StoreBusinessHours;
  email?: string;
  address?: string;
  phone?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  lineId?: string;
  isActive: boolean;
}

export interface StoreDetail extends Store {
  products?: StoreProduct[];
}

export interface StoreProduct {
  id: string;
  title: string;
  imageUrl?: string;
  bannerImageUrl?: string;
  category?: string;
  status?: string;
  pricePerDraw?: number;
  maxDraws?: number;
}

interface StoreApiResponse extends Partial<StoreDetail> {
  storeName?: string;
  shortDescription?: string;
  longDescription?: string;
  coverImageUrl?: string;
  status?: string;
}

interface StoreProductApiResponse extends Partial<StoreProduct> {
  storeId?: string;
}

const normalizeCoverImages = (raw: StoreApiResponse): string[] => {
  const coverImages = Array.isArray(raw.coverImages)
    ? raw.coverImages.filter(Boolean)
    : [];

  if (coverImages.length > 0) {
    return coverImages;
  }

  if (raw.coverImageUrl) {
    return [raw.coverImageUrl];
  }

  return [];
};

const normalizeStore = (raw: StoreApiResponse): StoreDetail => ({
  id: String(raw.id ?? ''),
  name: String(raw.name ?? raw.storeName ?? ''),
  description: raw.description ?? raw.shortDescription ?? '',
  shortDescription: raw.shortDescription ?? raw.description ?? '',
  longDescription: raw.longDescription ?? '',
  coverImages: normalizeCoverImages(raw),
  coverImageUrl: raw.coverImageUrl ?? raw.coverImages?.[0] ?? '',
  logoUrl: raw.logoUrl ?? '',
  businessHours: raw.businessHours ?? null,
  email: raw.email ?? '',
  address: raw.address ?? '',
  phone: raw.phone ?? '',
  facebookUrl: raw.facebookUrl ?? '',
  instagramUrl: raw.instagramUrl ?? '',
  lineId: raw.lineId ?? '',
  isActive:
    typeof raw.isActive === 'boolean'
      ? raw.isActive
      : String(raw.status ?? '').toUpperCase() !== 'INACTIVE',
  products: Array.isArray(raw.products)
    ? raw.products.map((product) => normalizeProduct(product))
    : [],
});

const normalizeProduct = (raw: StoreProductApiResponse): StoreProduct => ({
  id: String(raw.id ?? ''),
  title: String(raw.title ?? ''),
  imageUrl: raw.imageUrl ?? '',
  bannerImageUrl: raw.bannerImageUrl ?? '',
  category: raw.category ?? '',
  status: raw.status ?? '',
  pricePerDraw: raw.pricePerDraw ?? 0,
  maxDraws: raw.maxDraws ?? 0,
});

export const getStores = async (): Promise<ApiResponse<Store[]>> => {
  try {
    const res = await api.get(`${basePath}/list`);
    const data = Array.isArray(res.data?.data)
      ? res.data.data.map((item: StoreApiResponse) => normalizeStore(item))
      : [];

    return {
      ...res.data,
      data,
    };
  } catch (e) {
    console.error('Store - getStores error:', e);
    throw e;
  }
};

export const getStoreDetail = async (id: string): Promise<ApiResponse<StoreDetail>> => {
  try {
    const res = await api.get(`${basePath}/${id}`);
    return {
      ...res.data,
      data: res.data?.data ? normalizeStore(res.data.data as StoreApiResponse) : null,
    };
  } catch (e) {
    console.error('Store - getStoreDetail error:', e);
    throw e;
  }
};

export const getStoreProducts = async (
  id: string,
  req?: { page?: number; size?: number },
): Promise<PaginatedApiResponse<StoreProduct>> => {
  try {
    const res = await api.get(`${basePath}/${id}/products`, { params: req });
    const pageData = res.data?.data;
    return {
      ...res.data,
      data: pageData
        ? {
            ...pageData,
            data: Array.isArray(pageData.data)
              ? pageData.data.map((item: StoreProductApiResponse) => normalizeProduct(item))
              : [],
          }
        : null,
    };
  } catch (e) {
    console.error('Store - getStoreProducts error:', e);
    throw e;
  }
};
