// services/lotteryBrowseService.ts
import { api } from './FrontAPI';

const basePath = '/lottery/browse';

interface RequestData {
  [key: string]: any;
}

export const queryBrowseLotteries = async (
  req?: RequestData
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.post(`${basePath}/list`, req ?? undefined);
    return res.data;
  } catch (e) {
    console.error('LotteryBrowse - queryBrowseLotteries error:', e);
    throw e;
  }
};

export const getBrowseLotteryById = async (
  id: string
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}/${id}`);
    return res.data;
  } catch (e) {
    console.error('LotteryBrowse - getBrowseLotteryById error:', e);
    throw e;
  }
};
