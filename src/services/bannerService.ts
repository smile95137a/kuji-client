// services/bannerService.ts
import { api } from './FrontAPI';

const basePath = '/banner';

export interface BannerRes {
  id: string;
  imageUrl: string;
  mobileImageUrl: string | null;
  linkUrl: string | null;
  linkTarget: '_self' | '_blank' | null;
  title: string | null;
  sortOrder: number;
  startAt: string | null;
  endAt: string | null;
}

interface RequestData {
  [key: string]: any;
}

/** 前台 - 查詢啟用中的 Banner 列表（無需登入）
 *  端點：GET /banner/list
 *  後端自動過濾有效期限，依 sortOrder 排序
 */
export const getActiveBanners = async (
  req?: RequestData
): Promise<ApiResponse<BannerRes[]>> => {
  try {
    const res = await api.get(`${basePath}/list`, {
      params: req ?? undefined,
    });
    return res.data;
  } catch (e) {
    console.error('Banner - getActiveBanners error:', e);
    // 公開元件 — 不讓 Banner 錯誤導致整頁崩潰，回傳空列表
    return { success: false, code: 'ERROR', message: String(e), data: [] };
  }
};

/** @deprecated 使用 getActiveBanners */
export const getCarouselBanners = getActiveBanners;
