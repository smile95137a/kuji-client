// services/lotteryRandomService.ts
import { api } from './FrontAPI';
import type { DrawResult } from './lotteryDrawService';

const basePath = '/lottery/random';

export interface GachaDrawBatchResponse {
  playMode: 'LOTTERY_MODE';
  gameMode: 'RANDOM';
  results: DrawResult[];
  protectionEndTime: null;  // GACHA 不適用保護計時器
}

/** 前台 - 扭蛋加權隨機抽獎 POST /lottery/random/{lotteryId}/draw?count=N
 * 用於 category = GACHA 的商品
 * ⚠️ GACHA 使用 synchronized 鎖，不需要保護計時器邏輯
 */
export const randomDrawLottery = async (
  lotteryId: string,
  count: number = 1,
): Promise<ApiResponse<GachaDrawBatchResponse>> => {
  try {
    // count 是 API 的 @RequestParam，必須放在 query string
    const res = await api.post(`${basePath}/${lotteryId}/draw`, {}, { params: { count } });
    return res.data;
  } catch (e) {
    console.error('LotteryRandom - randomDrawLottery error:', e);
    throw e;
  }
};
