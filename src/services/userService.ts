// services/userService.ts
import { api } from './FrontAPI';

const basePath = '/user';

interface RequestData {
  [key: string]: any;
}

/** 前台 - 測試 API GET /user/hello */
export const helloUser = async (): Promise<any> => {
  try {
    const res = await api.get(`${basePath}/hello`);
    return res.data;
  } catch (e) {
    console.error('User - helloUser error:', e);
    throw e;
  }
};

/** 前台 - 取得我的資訊 GET /user/me */
export const getMe = async (): Promise<any> => {
  try {
    const res = await api.get(`${basePath}/me`);
    return res.data;
  } catch (e) {
    console.error('User - getMe error:', e);
    throw e;
  }
};

/** 前台 - 編輯我的資訊 PUT /user/me */
export const updateMe = async (data: RequestData): Promise<any> => {
  try {
    const res = await api.put(`${basePath}/me`, data);
    return res.data;
  } catch (e) {
    console.error('User - updateMe error:', e);
    throw e;
  }
};

/**
 * 前台 - 上傳頭像 POST /user/avatar
 * 後端回：{ imageUrl }
 */
export const uploadAvatar = async (file: File): Promise<any> => {
  try {
    const form = new FormData();
    form.append('file', file);

    const res = await api.post(`${basePath}/avatar`, form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return res.data;
  } catch (e) {
    console.error('User - uploadAvatar error:', e);
    throw e;
  }
};

/**
 * 前台 - 上傳並更新頭像（一步完成）POST /user/avatar/update
 * 後端回：UserRes（含新 avatar + wallet）
 */
export const uploadAndUpdateAvatar = async (file: File): Promise<any> => {
  try {
    const form = new FormData();
    form.append('file', file);

    const res = await api.post(`${basePath}/avatar/update`, form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return res.data;
  } catch (e) {
    console.error('User - uploadAndUpdateAvatar error:', e);
    throw e;
  }
};

/**
 *  常用：先上傳拿 imageUrl，再呼叫 PUT /user/me 更新 avatar
 * （對應你後端註解的 2-step 流程）
 */
export const uploadAvatarThenUpdateMe = async (file: File): Promise<any> => {
  try {
    const uploadRes = await uploadAvatar(file);
    const imageUrl = uploadRes?.data?.imageUrl || uploadRes?.imageUrl;

    if (!imageUrl) {
      throw new Error('uploadAvatarThenUpdateMe: imageUrl is empty');
    }

    const updateRes = await updateMe({ avatar: imageUrl });
    return updateRes;
  } catch (e) {
    console.error('User - uploadAvatarThenUpdateMe error:', e);
    throw e;
  }
};
