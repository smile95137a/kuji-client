// services/lotteryDrawService.ts
import { api } from './FrontAPI';

const basePath = '/lottery/draw';

// ── Request types ─────────────────────────────────────────────────

export interface DrawReq {
  count: number;       // 抽幾張（1~10，不可超過剩餘籤數）
  tickets?: string[];  // 指定票券 UUID 陣列（可選；不傳 = 後端隨機選）
}

// ── Response types ────────────────────────────────────────────────

/** 單筆抽獎結果 */
export interface DrawResult {
  success: boolean;
  ticketId?: string;
  ticketNumber?: string;           // string，格式如 "042"（非 number）
  revealedNumber?: number | null;  // SCRATCH_MODE 才有值
  prizeId?: string;
  prizeLevel?: string;
  prizeName?: string;
  prizeImageUrl?: string;
  isGrandPrize?: boolean;
  goldSpent: number;         // 本次扣除金幣
  bonusSpent: number;        // 本次扣除紅利
  remainingGold: number;     // 剩餘金幣（每筆結果都更新）
  remainingBonus: number;    // 剩餘紅利
  prizeBoxId?: string;       // 已放入獎品盒的 ID
  triggeredFreeDraw?: boolean;
  refundAmount?: number;
  message?: string;
}

/** 抽獎批次回應（不再是裸陣列） */
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

/** awaitingDesignation / designationPending 攔截回應（非開套玩家等待中） */
export interface DesignationPendingResponse {
  awaitingDesignation?: true;  // backward-compat discriminant
  designationPending?: true;   // spec-aligned discriminant
  message: string;             // human-readable hint from backend
  openerDeadline: string;      // ISO-8601 countdown target
}

/** 已指定的大獎中獎號碼 */
export interface DesignatedWinningNumber {
  revealedNumber: number;
  prizeId: string;
  prizeName: string;
  prizeLevel: string;
  prizeImageUrl: string | null;
}

/** 指定大獎回應 */
export interface DesignateResponse {
  success: boolean;
  message: string;
  designatedWinningNumbers: DesignatedWinningNumber[];
}

/** 場次資訊 */
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
  /** ISO-8601; null = no active designation window or already done */
  designationDeadline?: string | null;
  /** true = opener has designated prize numbers; default false for backwards compat */
  isDesignationComplete: boolean;
}

/** 籤位資訊 */
export interface LotteryTicketRes {
  id: string;
  ticketNumber: string;  // string 格式如 "042"（非 number）
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

/** 籤位列表回應（含 session 和 designatedWinningNumbers） */
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

// ── API functions ────────────────────────────────────────────────

/** 前台 - 執行抽獎 POST /lottery/draw/{lotteryId}/draw */
export const drawLottery = async (
  lotteryId: string,
  data: DrawReq,
): Promise<ApiResponse<DrawBatchResponse | DesignationRequiredResponse | DesignationPendingResponse>> => {
  try {
    const res = await api.post(`${basePath}/${lotteryId}/draw`, data);
    return res.data;
  } catch (e) {
    console.error('LotteryDraw - drawLottery error:', e);
    throw e;
  }
};

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
): Promise<ApiResponse<SessionResponse | null>> => {
  try {
    const res = await api.get(`${basePath}/${lotteryId}/session`);
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
