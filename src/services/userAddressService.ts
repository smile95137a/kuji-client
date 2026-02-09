// services/userAddressService.ts
import { api } from './FrontAPI';

const basePath = '/user/addresses';

interface RequestData {
  [key: string]: any;
}

/** 前台 - 新增收件地址 POST /user/addresses */
export const createUserAddress = async (
  payload: RequestData,
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.post(`${basePath}`, payload);
    return res.data;
  } catch (e) {
    console.error('UserAddress - createUserAddress error:', e);
    throw e;
  }
};

/** 前台 - 更新收件地址 PUT /user/addresses/{id} */
export const updateUserAddress = async (
  id: string,
  payload: RequestData,
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.put(`${basePath}/${id}`, payload);
    return res.data;
  } catch (e) {
    console.error('UserAddress - updateUserAddress error:', e);
    throw e;
  }
};

/** 前台 - 刪除收件地址 DELETE /user/addresses/{id} */
export const deleteUserAddress = async (
  id: string,
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.delete(`${basePath}/${id}`);
    return res.data;
  } catch (e) {
    console.error('UserAddress - deleteUserAddress error:', e);
    throw e;
  }
};

/** 前台 - 取得收件地址詳情 GET /user/addresses/{id} */
export const getUserAddressDetail = async (
  id: string,
  req?: RequestData,
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}/${id}`, {
      params: req ?? undefined,
    });
    return res.data;
  } catch (e) {
    console.error('UserAddress - getUserAddressDetail error:', e);
    throw e;
  }
};

/** 前台 - 取得所有收件地址 GET /user/addresses */
export const getUserAddresses = async (
  req?: RequestData,
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}`, {
      params: req ?? undefined,
    });
    return res.data;
  } catch (e) {
    console.error('UserAddress - getUserAddresses error:', e);
    throw e;
  }
};

/** 前台 - 取得預設收件地址 GET /user/addresses/default */
export const getDefaultUserAddress = async (
  req?: RequestData,
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}/default`, {
      params: req ?? undefined,
    });
    return res.data;
  } catch (e) {
    console.error('UserAddress - getDefaultUserAddress error:', e);
    throw e;
  }
};

/** 前台 - 設定預設收件地址 PUT /user/addresses/{id}/default */
export const setDefaultUserAddress = async (
  id: string,
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.put(`${basePath}/${id}/default`);
    return res.data;
  } catch (e) {
    console.error('UserAddress - setDefaultUserAddress error:', e);
    throw e;
  }
};
