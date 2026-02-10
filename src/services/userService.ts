// services/userService.ts
import { api } from './FrontAPI';

const basePath = '/user';

interface RequestData {
  [key: string]: any;
}

/** 前台 - 取得我的資訊 GET /user/me */
export const getMyProfile = async (
  req?: RequestData
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}/me`, {
      params: req ?? undefined,
    });
    return res.data;
  } catch (e) {
    console.error('User - getMyProfile error:', e);
    throw e;
  }
};

/** 前台 - 更新我的資訊 PUT /user/me */
export const updateMyProfile = async (
  payload: RequestData
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.put(`${basePath}/me`, payload);
    return res.data;
  } catch (e) {
    console.error('User - updateMyProfile error:', e);
    throw e;
  }
};

/** 前台 - 上傳使用者頭像 POST /user/avatar */
export const uploadAvatar = async (
  file: File
): Promise<ApiResponse<{ imageUrl: string }>> => {
  try {
    const form = new FormData();
    form.append('file', file);

    const res = await api.post(`${basePath}/avatar`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (e) {
    console.error('User - uploadAvatar error:', e);
    throw e;
  }
};

/** 前台 - 上傳並更新使用者頭像 POST /user/avatar/update */
export const uploadAndUpdateAvatar = async (
  file: File
): Promise<ApiResponse<any>> => {
  try {
    const form = new FormData();
    form.append('file', file);

    const res = await api.post(`${basePath}/avatar/update`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (e) {
    console.error('User - uploadAndUpdateAvatar error:', e);
    throw e;
  }
};
