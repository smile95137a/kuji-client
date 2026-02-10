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

/**
 * 前台 - 執行抽獎 POST /lottery/draw/{lotteryId}/draw
 *
 * ⚠️ 新版 API (2026-02-07)：
 *   - 指定票券：{ count: N, ticket: [uuid1, uuid2, ...] }  （ticket.length === count）
 *   - 隨機抽獎：{ count: N }                               （不帶 ticket 由後端隨機選）
 *   - 回傳統一為陣列 data: [...]
 *
 * @param lotteryId 商品 ID
 * @param payload.count   抽獎次數
 * @param payload.ticket  指定票券 UUID 列表（選填，不傳=隨機）
 */
export const drawLottery = async (
  lotteryId: string,
  payload: { count: number; ticket?: string[] }
): Promise<ApiResponse<any[]>> => {
  try {
    const body: Record<string, any> = { count: payload.count };
    if (payload.ticket && payload.ticket.length > 0) {
      body.ticket = payload.ticket;
    }
    const res = await api.post(`${basePath}/${lotteryId}/draw`, body);
    return res.data;
  } catch (e) {
    console.error('LotteryDraw - drawLottery error:', e);
    throw e;
  }
};

/**
 * 前台 - 批次抽獎（指定票券 UUID）POST /lottery/draw/{lotteryId}/draw
 * ⚠️ ticket 陣列長度必須等於 count，不可包含重複項目
 */
export const batchDrawLottery = async (
  lotteryId: string,
  payload: { count: number; ticket: string[] }
): Promise<ApiResponse<any[]>> => {
  try {
    const res = await api.post(`${basePath}/${lotteryId}/draw`, {
      count: payload.count,
      ticket: payload.ticket,
    });
    return res.data;
  } catch (e) {
    console.error('LotteryDraw - batchDrawLottery error:', e);
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
