// services/rechargePlanService.ts
import { api } from './FrontAPI';

const basePath = '/recharge-plan';

export interface RechargePlanRes {
  id: string;
  name: string;
  description: string;
  price: number;
  goldCoins: number;
  bonusCoins: number;
  imageUrl: string | null;
  isHot: boolean;
  sortOrder: number;
  startAt: string | null;
  endAt: string | null;
}

/** 前台 - 查詢有效的儲值方案列表 GET /api/recharge-plan/list
 *  後端自動過濾：只返回 isActive=true 且在有效期限內的方案
 */
export const getActiveRechargePlans = async (): Promise<ApiResponse<RechargePlanRes[]>> => {
  try {
    const res = await api.get(`${basePath}/list`);
    return res.data;
  } catch (e) {
    console.error('RechargePlan - getActiveRechargePlans error:', e);
    throw e;
  }
};

/** 前台 - 查詢儲值方案詳情 GET /api/recharge-plan/{id} */
export const getRechargePlanDetail = async (
  id: string,
): Promise<ApiResponse<RechargePlanRes>> => {
  try {
    const res = await api.get(`${basePath}/${id}`);
    return res.data;
  } catch (e) {
    console.error('RechargePlan - getRechargePlanDetail error:', e);
    throw e;
  }
};
