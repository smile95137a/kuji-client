// services/bannerService.ts
import { api } from './FrontAPI';

const basePath = '/banner';

interface RequestData {
  [key: string]: any;
}

/** 前台 - 查詢啟用中的 Banner 列表（無需登入） */
export const getActiveBanners = async (
  req?: RequestData
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}/list`, {
      params: req ?? undefined,
    });
    return res.data;
  } catch (e) {
    console.error('Banner - getActiveBanners error:', e);
    throw e;
  }
};

/** @deprecated 使用 getActiveBanners */
export const getCarouselBanners = getActiveBanners;
