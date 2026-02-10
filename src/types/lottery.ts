// src/types/lottery.ts - 商品/抽獎相關類型定義

/** 商品分類 */
export type LotteryCategory =
  | 'OFFICIAL_ICHIBAN' // 官方一番賞
  | 'CUSTOM_GACHA' // 自製賞
  | 'PRIZE_CAPSULE' // 扭蛋
  | 'SCRATCH_CARD' // 刮刮樂
  | 'CARD_DRAW'; // 卡牌抽選

/** 商品狀態 */
export type LotteryStatus =
  | 'ON_SHELF' // 上架中
  | 'OFF_SHELF' // 已下架
  | 'SOLD_OUT' // 已售罄
  | 'COMING_SOON'; // 即將開賣

/** 籤位狀態 */
export type TicketStatus =
  | 'AVAILABLE' // 可抽
  | 'DRAWN' // 已抽
  | 'RESERVED'; // 保留中

/** 獎品等級 */
export type PrizeLevel =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'LAST' // 最後賞
  | 'THANKS'; // 謝謝惠顧（刮刮樂）

/** 商品基本資訊 */
export interface LotteryInfo {
  id: string;
  title: string;
  description?: string;
  mainImageUrl?: string;
  subImages?: string[];
  category: LotteryCategory;
  pricePerDraw: number;
  currentPrice?: number;
  totalDraws: number;
  remainingDraws: number;
  status: LotteryStatus;
  gameMode?: 'RANDOM' | 'DESIGNATED';
  freeDrawEnabled?: boolean;
  protectionDraws?: number;
  protectionMinutes?: number;
  storeName?: string;
  storeCity?: string;
  storeDistrict?: string;
  startTime?: string;
  endTime?: string;
  createdAt?: string;
}

/** 獎品資訊 */
export interface PrizeInfo {
  id: string;
  level: PrizeLevel;
  name: string;
  imageUrl?: string;
  quantity: number;
  remaining: number;
  isGrandPrize?: boolean;
  recyclable?: boolean;
  recycleBonus?: number;
}

/** 籤位資訊 */
export interface TicketInfo {
  ticketNumber: number;
  status: TicketStatus;
  prizeLevel?: PrizeLevel;
  prizeName?: string;
  prizeImageUrl?: string;
  isGrandPrize?: boolean;
  isLastPrize?: boolean;
  drawnByNickname?: string;
  drawnAt?: string;
}

/** 場次資訊 */
export interface SessionInfo {
  sessionId?: string;
  isOpener?: boolean;
  openerNickname?: string;
  protectionEndTime?: string;
  protectionDraws?: number;
  openerDrawCount?: number;
  freeDrawEnabled?: boolean;
  status?: 'ACTIVE' | 'ENDED';
  canDraw?: boolean;
  cannotDrawReason?: string;
}

/** 抽獎結果 */
export interface DrawResult {
  success: boolean;
  ticketNumber: number;
  prizeId?: string;
  prizeLevel: PrizeLevel;
  prizeName: string;
  prizeImageUrl?: string;
  isGrandPrize?: boolean;
  triggeredFreeDraw?: boolean;
  refundAmount?: number;
  message?: string;
}

/** 商品詳情（完整） */
export interface LotteryDetail {
  lottery: LotteryInfo;
  prizes: PrizeInfo[];
  tickets: TicketInfo[];
  session?: SessionInfo;
}

/** 取得分類中文標籤 */
export const getCategoryLabel = (category: LotteryCategory | string): string => {
  switch (category) {
    case 'OFFICIAL_ICHIBAN':
      return '一番賞';
    case 'CUSTOM_GACHA':
      return '自製賞';
    case 'PRIZE_CAPSULE':
      return '扭蛋';
    case 'SCRATCH_CARD':
      return '刮刮樂';
    case 'CARD_DRAW':
      return '卡牌';
    default:
      return '商品';
  }
};

/** 取得狀態中文標籤 */
export const getStatusLabel = (status: LotteryStatus | string): string => {
  switch (status) {
    case 'ON_SHELF':
      return '🟢 開抽中';
    case 'OFF_SHELF':
      return '🔴 已下架';
    case 'SOLD_OUT':
      return '⚫ 已售罄';
    case 'COMING_SOON':
      return '🟡 即將開賣';
    default:
      return status || '-';
  }
};

/** 取得獎品等級中文標籤 */
export const getPrizeLevelLabel = (level: PrizeLevel | string): string => {
  if (level === 'LAST') return 'Last One 賞';
  if (level === 'THANKS') return '謝謝惠顧';
  return `${level}賞`;
};

/** 判斷是否需要刮刮樂動畫 */
export const isScratchCard = (category: LotteryCategory | string): boolean => {
  return category === 'SCRATCH_CARD';
};

/** 判斷是否需要扭蛋動畫 */
export const isGachapon = (category: LotteryCategory | string): boolean => {
  return category === 'PRIZE_CAPSULE';
};

/** 判斷是否需要卡牌翻轉動畫 */
export const isCardDraw = (category: LotteryCategory | string): boolean => {
  return category === 'CARD_DRAW';
};

/** 判斷是否需要一番賞撕卡動畫 */
export const isIchiban = (category: LotteryCategory | string): boolean => {
  return category === 'OFFICIAL_ICHIBAN' || category === 'CUSTOM_GACHA';
};
