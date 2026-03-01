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

/** 單筆抽獎結果 */
export interface DrawResult {
  success: boolean;
  ticketId?: string;
  ticketNumber?: number;
  revealedNumber?: number | null; // SCRATCH_MODE 才有值
  prizeId?: string;
  prizeLevel?: string;
  prizeName?: string;
  prizeImageUrl?: string;
  isGrandPrize?: boolean;
  triggeredFreeDraw?: boolean;
  refundAmount?: number;
  message?: string;
}

/** 抽獎批次回應（v4.0 Breaking Change：不再是裸陣列） */
export interface DrawBatchResponse {
  playMode: string;  // 'LOTTERY_MODE' | 'SCRATCH_MODE' | 'SCRATCH_CARD_MODE'
  gameMode: string;  // 'RANDOM' | 'SCRATCH_STORE' | 'SCRATCH_PLAYER'
  results: DrawResult[];
  /** 保護結束時間；扭蛋(GACHA)為 null；首次抽獎時設定 */
  protectionEndTime: string | null;
}

/** designationRequired 回應中的大獎資訊 */
export interface GrandPrizeInfo {
  prizeId: string;
  prizeName: string;
  prizeLevel: string;
  quantity: number;  // 此獎項需要指定幾個 revealedNumber
  prizeImageUrl?: string | null;
}

/** designationRequired 攔截回應 */
export interface DesignationRequiredResponse {
  designationRequired: true;
  message: string;
  availableNumbers: number[];
  grandPrizes: GrandPrizeInfo[];
}

/** ✅ 新增：已指定的大獎中獎號碼 */
export interface DesignatedWinningNumber {
  revealedNumber: number;
  prizeId: string;
  prizeName: string;
  prizeLevel: string;
  prizeImageUrl: string | null;
}

/** ✅ 新增：指定大獎回應 */
export interface DesignateResponse {
  success: boolean;
  message: string;
  designatedWinningNumbers: DesignatedWinningNumber[];
}

/** ✅ 新增：場次資訊 */
export interface SessionResponse {
  sessionId: string;
  isOpener: boolean;
  openerNickname: string | null;
  protectionDraws: number;
  /** 保護結束時間；null 表示保護未啟動或扭蛋模式 */
  protectionEndTime: string | null;
  openerDrawCount: number;
  freeDrawEnabled: boolean;
  status: string; // 'ACTIVE' | 'EXPIRED'
  canDraw?: boolean;
  cannotDrawReason?: string | null;
}

/** ✅ 新增：籤位資訊 */
export interface LotteryTicketRes {
  id: string;
  ticketNumber: number;
  status: 'AVAILABLE' | 'DRAWN' | 'LOCKED' | string;
  revealedNumber?: number | null;
  prizeId?: string;
  prizeLevel?: string;
  prizeName?: string;
  prizeImageUrl?: string;
  isGrandPrize?: boolean;
  isLastPrize?: boolean;
  drawnByNickname?: string;
  drawnAt?: string;
}

/** ✅ 新增：籤位列表回應（含 session 和 designatedWinningNumbers） */
export interface TicketListResponse {
  tickets: LotteryTicketRes[];
  session: SessionResponse | null;
  designatedWinningNumbers: DesignatedWinningNumber[];
}

/** 前台 - 指定大獎位置（刮刮樂模式） POST /lottery/draw/{lotteryId}/designate */
export interface PrizeDesignation {
  /** 刮開後的號碼（來自 /draw response 的 availableNumbers），不是 ticketNumber */
  revealedNumber: number;
  prizeId: string;
}

export const designatePrizePositions = async (
  lotteryId: string,
  payload: { designations: PrizeDesignation[] },
): Promise<ApiResponse<DesignateResponse>> => {
  try {
    const res = await api.post(`${basePath}/${lotteryId}/designate`, payload);
    return res.data;
  } catch (e) {
    console.error('LotteryDraw - designatePrizePositions error:', e);
    throw e;
  }
};

/** 前台 - 取得目前場次資訊 GET /lottery/draw/{lotteryId}/session
 * 唯讀查詢，不會建立新 session。無進行中場次時 data 為 null。
 */
export const getLotterySession = async (
  lotteryId: string,
  req?: RequestData,
): Promise<ApiResponse<SessionResponse | null>> => {
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
): Promise<ApiResponse<TicketListResponse>> => {
  try {
    const res = await api.get(`${basePath}/${lotteryId}/tickets`);
    return res.data;
  } catch (e) {
    console.error('LotteryDraw - getLotteryTickets error:', e);
    throw e;
  }
};
