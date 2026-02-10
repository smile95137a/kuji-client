// services/enumService.ts
import { api } from './FrontAPI';

const basePath = '/enum';

interface RequestData {
  [key: string]: any;
}

/** 前台 - 一次取得所有 Enum 選項（無需登入） GET /enums/all */
export const getAllEnums = async (
  req?: RequestData
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}/all`, {
      params: req ?? undefined,
    });
    return res.data;
  } catch (e) {
    console.error('Enums - getAllEnums error:', e);
    throw e;
  }
};

/** 前台 - 獎項等級選項 GET /enums/prize-level */
export const getPrizeLevelOptions = async (
  req?: RequestData
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}/prize-level`, {
      params: req ?? undefined,
    });
    return res.data;
  } catch (e) {
    console.error('Enums - getPrizeLevelOptions error:', e);
    throw e;
  }
};

/** 前台 - 獎品類型選項 GET /enums/prize-type */
export const getPrizeTypeOptions = async (
  req?: RequestData
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}/prize-type`, {
      params: req ?? undefined,
    });
    return res.data;
  } catch (e) {
    console.error('Enums - getPrizeTypeOptions error:', e);
    throw e;
  }
};

/** 前台 - 店家狀態選項 GET /enums/store-status */
export const getStoreStatusOptions = async (
  req?: RequestData
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}/store-status`, {
      params: req ?? undefined,
    });
    return res.data;
  } catch (e) {
    console.error('Enums - getStoreStatusOptions error:', e);
    throw e;
  }
};

/** 前台 - 管理員狀態選項 GET /enums/admin-user-status */
export const getAdminUserStatusOptions = async (
  req?: RequestData
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}/admin-user-status`, {
      params: req ?? undefined,
    });
    return res.data;
  } catch (e) {
    console.error('Enums - getAdminUserStatusOptions error:', e);
    throw e;
  }
};

/** 前台 - 角色代碼選項 GET /enums/role-code */
export const getRoleCodeOptions = async (
  req?: RequestData
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}/role-code`, {
      params: req ?? undefined,
    });
    return res.data;
  } catch (e) {
    console.error('Enums - getRoleCodeOptions error:', e);
    throw e;
  }
};

/** 前台 - 店家使用者角色類型選項 GET /enums/store-user-role-type */
export const getStoreUserRoleTypeOptions = async (
  req?: RequestData
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}/store-user-role-type`, {
      params: req ?? undefined,
    });
    return res.data;
  } catch (e) {
    console.error('Enums - getStoreUserRoleTypeOptions error:', e);
    throw e;
  }
};

/** 前台 - 最新消息狀態選項 GET /enums/news-status */
export const getNewsStatusOptions = async (
  req?: RequestData
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}/news-status`, {
      params: req ?? undefined,
    });
    return res.data;
  } catch (e) {
    console.error('Enums - getNewsStatusOptions error:', e);
    throw e;
  }
};

/** 前台 - Banner 狀態選項 GET /enums/banner-status */
export const getBannerStatusOptions = async (
  req?: RequestData
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}/banner-status`, {
      params: req ?? undefined,
    });
    return res.data;
  } catch (e) {
    console.error('Enums - getBannerStatusOptions error:', e);
    throw e;
  }
};
