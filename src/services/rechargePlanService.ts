// services/rechargePlanService.ts
import { api } from './FrontAPI';

const basePath = '/recharge-plan';

interface RequestData {
  [key: string]: any;
}

/** 前台 - 查詢有效的儲值方案列表（無需登入） GET /api/recharge-plan/list */
export const getActiveRechargePlans = async (
  req?: RequestData
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}/list`, {
      params: req ?? undefined,
    });
    return res.data;
  } catch (e) {
    console.error('RechargePlan - getActiveRechargePlans error:', e);
    throw e;
  }
};

/** 前台 - 查詢儲值方案詳情（無需登入） GET /api/recharge-plan/{id} */
export const getRechargePlanDetail = async (
  id: string,
  req?: RequestData
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}/${id}`, {
      params: req ?? undefined,
    });
    return res.data;
  } catch (e) {
    console.error('RechargePlan - getRechargePlanDetail error:', e);
    throw e;
  }
};
