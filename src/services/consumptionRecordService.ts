// services/consumptionRecordService.ts
import { api } from './FrontAPI';

const basePath = '/consumption-records';

interface RequestData {
  [key: string]: any;
}

export const getMyConsumptionRecords = async (
  req?: RequestData,
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.post(`${basePath}/list`, req ?? null);
    return res.data;
  } catch (e) {
    console.error('ConsumptionRecord - getMyConsumptionRecords error:', e);
    throw e;
  }
};
