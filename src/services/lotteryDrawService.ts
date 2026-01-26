// services/lotteryDrawService.ts
import { api } from './FrontAPI';

const basePath = '/lottery/draw';

interface RequestData {
  [key: string]: any;
}

/** 前台 - 取得籤位列表（安全版本）（需登入才會帶 session） GET /lottery/draw/{lotteryId}/tickets */
export const getTickets = async (
  lotteryId: string,
  req?: RequestData
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}/${lotteryId}/tickets`, {
      params: req ?? undefined,
    });
    return res.data;
  } catch (e) {
    console.error('LotteryDraw - getTickets error:', e);
    throw e;
  }
};

/** 前台 - 執行抽獎 POST /lottery/draw/{lotteryId}/draw
 * ticketNumber: null = 隨機抽
 * drawCount: 連抽次數（預設 1）
 */
export const drawLottery = async (
  lotteryId: string,
  payload: { ticketNumber?: number | null; drawCount?: number | null }
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.post(`${basePath}/${lotteryId}/draw`, {
      ticketNumber: payload.ticketNumber ?? null,
      drawCount: payload.drawCount ?? 1,
    });
    return res.data;
  } catch (e) {
    console.error('LotteryDraw - drawLottery error:', e);
    throw e;
  }
};

/** 前台 - 指定大獎位置（刮刮樂模式） POST /lottery/draw/{lotteryId}/designate */
export const designatePrizePositions = async (
  lotteryId: string,
  payload: { prizeNumbers: number[] }
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
  req?: RequestData
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
