// services/marqueeService.ts
import { api } from './FrontAPI';

const basePath = '/marquee';

interface RequestData {
  [key: string]: any;
}

/** 前台 - 取得所有啟用中的跑馬燈（無需登入） */
export const getActiveMarquees = async (
  req?: RequestData
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}`, {
      params: req ?? undefined,
    });
    return res.data;
  } catch (e) {
    console.error('Marquee - getActiveMarquees error:', e);
    throw e;
  }
};
