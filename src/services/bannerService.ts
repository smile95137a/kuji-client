// services/bannerService.ts
import { api } from './FrontAPI';

const basePath = '/banner';

interface RequestData {
  [key: string]: any;
}

/** 前台 - 查詢輪播 Banner（無需登入） */
export const getCarouselBanners = async (
  req?: RequestData
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}/carousel`, {
      params: req ?? undefined,
    });
    return res.data;
  } catch (e) {
    console.error('Banner - getCarouselBanners error:', e);
    throw e;
  }
};
