// services/lotteryDrawService.ts
import { api } from './FrontAPI';

const basePath = '/lottery/draw';

interface RequestData {
  [key: string]: any;
}

/** 前台 - 執行抽獎 POST /lottery/draw/{lotteryId}/draw
 * ticketNumber: null = 隨機抽
 * drawCount: 連抽次數（預設 1）
 */
export const drawLottery = async (
  lotteryId: string,
  data: any,
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.post(`${basePath}/${lotteryId}/draw`, data);
    return res.data;
  } catch (e) {
    console.error('LotteryDraw - drawLottery error:', e);
    throw e;
  }
};

/** 前台 - 指定大獎位置（刮刮樂模式） POST /lottery/draw/{lotteryId}/designate */
export interface PrizeDesignation {
  ticketNumber: number;
  prizeId: string;
}

export const designatePrizePositions = async (
  lotteryId: string,
  payload: { designations: PrizeDesignation[] },
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.post(`${basePath}/${lotteryId}/designate`, payload);
    return res.data;
  } catch (e) {
    console.error('LotteryDraw - designatePrizePositions error:', e);
    throw e;
  }
};

/** 前台 - 取得目前場次資訊 GET /lottery/draw/{lotteryId}/session */
export const getLotterySession = async (
  lotteryId: string,
  req?: RequestData,
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}/${lotteryId}/session`, {
      params: req ?? undefined,
    });
    return res.data;
  } catch (e) {
    console.error('LotteryDraw - getLotterySession error:', e);
    throw e;
  }
};

/** 前台 - 查詢籤位列表 GET /lottery/draw/{lotteryId}/tickets */
export const getLotteryTickets = async (
  lotteryId: string,
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}/${lotteryId}/tickets`);
    return res.data;
  } catch (e) {
    console.error('LotteryDraw - getLotteryTickets error:', e);
    throw e;
  }
};
