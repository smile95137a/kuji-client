// services/categoryService.ts
import { api } from './FrontAPI';

const basePath = '/category';

/**
 * 類別查詢條件
 */
export interface CategoryCondition {
  /** 商品狀態 */
  status?: 'ON_SHELF' | 'OFF_SHELF' | 'SOLD_OUT';
  /** 主題名稱 */
  theme?: string;
  /** 類別 */
  category?: string;
}

/**
 * 查詢請求
 */
export interface CategoryQueryReq {
  condition?: CategoryCondition;
  page?: number;
  size?: number;
}

/**
 * 類別回應 DTO
 */
export interface CategoryRes {
  /** 類別名稱（category 或 theme） */
  name: string;
  /** 類別類型（category / theme） */
  type?: string;
  /** 商品數量 */
  productCount?: number;
  /** 代表圖片 */
  imageUrl?: string;
  /** 顯示順序 */
  displayOrder?: number;
  /** 熱門度 */
  hotCount?: number;
}

/**
 * 查詢商品類別
 * POST /category/categories
 */
export const queryCategories = async (
  req?: CategoryQueryReq,
): Promise<ApiResponse<CategoryRes[]>> => {
  try {
    const res = await api.post(`${basePath}/categories`, req ?? undefined);
    return res.data;
  } catch (e) {
    console.error('Category - queryCategories error:', e);
    throw e;
  }
};

/**
 * 查詢商品主題
 * POST /category/themes
 */
export const queryThemes = async (
  req?: CategoryQueryReq,
): Promise<ApiResponse<CategoryRes[]>> => {
  try {
    const res = await api.post(`${basePath}/themes`, req ?? undefined);
    return res.data;
  } catch (e) {
    console.error('Category - queryThemes error:', e);
    throw e;
  }
};

/**
 * 查詢商品標籤
 * POST /category/tags
 */
export const queryTags = async (
  req?: CategoryQueryReq,
): Promise<ApiResponse<CategoryRes[]>> => {
  try {
    const res = await api.post(`${basePath}/tags`, req ?? undefined);
    return res.data;
  } catch (e) {
    console.error('Category - queryTags error:', e);
    throw e;
  }
};

/**
 * 查詢熱門主題
 * GET /category/hot-themes
 */
export const getHotThemes = async (
  limit: number = 10,
): Promise<ApiResponse<CategoryRes[]>> => {
  try {
    const res = await api.get(`${basePath}/hot-themes`, {
      params: { limit },
    });
    return res.data;
  } catch (e) {
    console.error('Category - getHotThemes error:', e);
    throw e;
  }
};

/**
 * 查詢指定主題的商品數量
 * GET /category/theme/{themeName}/count
 */
export const getThemeProductCount = async (
  themeName: string,
): Promise<ApiResponse<number>> => {
  try {
    const res = await api.get(`${basePath}/theme/${themeName}/count`);
    return res.data;
  } catch (e) {
    console.error('Category - getThemeProductCount error:', e);
    throw e;
  }
};
