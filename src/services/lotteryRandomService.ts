// services/lotteryRandomService.ts
import { api } from './FrontAPI';

const basePath = '/lottery/random';

/** 前台 - 扭蛋加權隨機抽獎 POST /lottery/random/{lotteryId}/draw
 * 用於 category = GACHA 的商品（無 playMode 概念）
 */
export const randomDrawLottery = async (
  lotteryId: string,
  count: number = 1,
): Promise<ApiResponse<any>> => {
  try {
    // count 是 API 的 @RequestParam，必須放在 query string
    const res = await api.post(`${basePath}/${lotteryId}/draw`, {}, { params: { count } });
    return res.data;
  } catch (e) {
    console.error('LotteryRandom - randomDrawLottery error:', e);
    throw e;
  }
};
