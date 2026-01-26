// services/newsService.ts
import { api } from './FrontAPI';

const basePath = '/news';

interface RequestData {
  [key: string]: any;
}

/** 前台 - 查詢最新消息列表（無需登入）
 *  - limit: 限制數量（可選，用於首頁顯示最新 N 則）
 */
export const getPublishedNews = async (
  req?: RequestData
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}`, {
      params: req ?? undefined,
    });
    return res.data;
  } catch (e) {
    console.error('News - getPublishedNews error:', e);
    throw e;
  }
};

/** 前台 - 查詢最新消息詳情（無需登入）
 *  - id: 最新消息 ID
 */
export const getNewsDetail = async (id: string): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}/${id}`);
    return res.data;
  } catch (e) {
    console.error('News - getNewsDetail error:', e);
    throw e;
  }
};
