// services/newsService.ts
import { api } from './FrontAPI';

const basePath = '/news';

export interface NewsRes {
  id: string;
  title: string;
  summary: string;
  content: string;
  coverImageUrl: string | null;
  category: string | null;
  publishedAt: string;
  isTop: boolean;
}

export interface NewsListReq {
  page?: number;    // 從 0 開始，預設 0
  size?: number;    // 每頁筆數，預設 10
  category?: string;
}

/** 前台 - 查詢最新消息列表（無需登入）
 *  端點：GET /news/list
 *  - limit: 限制數量（可選，用於首頁顯示最新 N 則）
 */
export const getPublishedNews = async (
  req?: NewsListReq
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}/list`, {
      params: req ?? undefined,
    });
    return res.data;
  } catch (e) {
    console.error('News - getPublishedNews error:', e);
    throw e;
  }
};

/** 前台 - 查詢最新消息詳情（無需登入）
 *  端點：GET /news/{id}
 *  content 為 HTML，需用 v-html 渲染
 */
export const getNewsDetail = async (id: string): Promise<ApiResponse<NewsRes>> => {
  try {
    const res = await api.get(`${basePath}/${id}`);
    return res.data;
  } catch (e) {
    console.error('News - getNewsDetail error:', e);
    throw e;
  }
};
