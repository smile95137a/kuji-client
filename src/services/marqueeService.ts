// services/marqueeService.ts
import { api } from './FrontAPI';

const basePath = '/marquee';

export interface MarqueeRes {
  id: string;
  content: string;
  url: string | null;
  sortOrder: number;
  startAt: string | null;
  endAt: string | null;
}

interface RequestData {
  [key: string]: any;
}

/** 前台 - 取得所有啟用中的跑馬燈（無需登入）
 *  端點：GET /marquee/list
 */
export const getActiveMarquees = async (
  req?: RequestData
): Promise<ApiResponse<MarqueeRes[]>> => {
  try {
    const res = await api.get(`${basePath}/list`, {
      params: req ?? undefined,
    });
    return res.data;
  } catch (e) {
    console.error('Marquee - getActiveMarquees error:', e);
    return { success: false, code: 'ERROR', message: String(e), data: [] };
  }
};
