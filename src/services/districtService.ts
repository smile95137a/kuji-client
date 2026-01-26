// src/services/districtService.ts
import { api } from './FrontAPI';

const basePath = '/district';

interface RequestData {
  [key: string]: any;
}

/** 前台 - 取得所有縣市列表 */
export const getAllCities = async (
  req?: RequestData,
): Promise<ApiResponse<string[]>> => {
  try {
    const res = await api.get(`${basePath}/cities`, {
      params: req ?? undefined,
    });
    return res.data;
  } catch (e) {
    console.error('District - getAllCities error:', e);
    throw e;
  }
};

/** 前台 - 取得指定縣市的鄉鎮市區列表 */
export const getDistrictsByCity = async (
  city: string,
  req?: RequestData,
): Promise<ApiResponse<any[]>> => {
  try {
    const res = await api.get(
      `${basePath}/districts/${encodeURIComponent(city)}`,
      {
        params: req ?? undefined,
      },
    );
    return res.data;
  } catch (e) {
    console.error('District - getDistrictsByCity error:', e);
    throw e;
  }
};

/** 前台 - 取得所有縣市及其鄉鎮市區（樹狀結構） */
export const getDistrictTree = async (
  req?: RequestData,
): Promise<ApiResponse<Record<string, any[]>>> => {
  try {
    const res = await api.get(`${basePath}/tree`, {
      params: req ?? undefined,
    });
    return res.data;
  } catch (e) {
    console.error('District - getDistrictTree error:', e);
    throw e;
  }
};

/** 前台 - 取得完整行政區資料（包含郵遞區號） */
export const getAllDistricts = async (
  req?: RequestData,
): Promise<ApiResponse<any[]>> => {
  try {
    const res = await api.get(`${basePath}/all`, {
      params: req ?? undefined,
    });
    return res.data;
  } catch (e) {
    console.error('District - getAllDistricts error:', e);
    throw e;
  }
};

/** 前台 - 根據縣市 + 區域取得完整資訊（含 zipCode） */
export const getDistrict = async (
  city: string,
  district: string,
  req?: RequestData,
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}`, {
      params: {
        city,
        district,
        ...(req ?? {}),
      },
    });
    return res.data;
  } catch (e) {
    console.error('District - getDistrict error:', e);
    throw e;
  }
};
