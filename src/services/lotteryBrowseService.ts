// services/lotteryBrowseService.ts
import { api } from './FrontAPI';
import type { ApiResponse, PaginatedApiResponse, PageResult } from '@/types/api';

const basePath = '/lottery/browse';

export type LotteryLifecycleStatus =
  | 'DRAFT'
  | 'WAITING_ON_SHELF'
  | 'ON_SHELF'
  | 'OFF_SHELF'
  | 'GRAND_PRIZE_DRAWN'
  | 'ALL_DRAWN'
  | 'FORCED_OFF'
  | 'DELETED';

// ── Response types ──────────────────────────────────────────────

export interface LotteryRes {
  id: string;
  storeId: string;
  storeName: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;        // OFFICIAL_ICHIBAN / GACHA / TRADING_CARD / CUSTOM_GACHA
  subCategory: string | null;
  playMode: string;        // LOTTERY_MODE / SCRATCH_MODE
  gameMode: string | null; // RANDOM / SCRATCH_STORE / SCRATCH_PLAYER
  pricePerDraw: number;
  totalDraws: number;
  remainingDraws: number;
  maxDrawsPerUser: number | null;
  status: string;
  grandPrizeAutoDiscount: boolean;
  discountedPricePerDraw: number | null;
  createdAt: string;
}

export interface LotteryPrizeRes {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  level: string;           // A / B / C / ... / LAST / GRAND
  quantity: number;
  remaining: number;
  weight: number;
  isGrandPrize: boolean;
  sortOrder: number;
}

export interface LotteryTicketRes {
  id: string;
  ticketNumber: string;
  revealedNumber: number | null;
  status: 'AVAILABLE' | 'DRAWN' | 'SCRATCHED';
  prizeId?: string;
  prizeLevel?: string;
  prizeName?: string;
  drawnAt?: string;
}

export interface LotteryBrowseListItemRes {
  lottery: LotteryRes;
  prizes: LotteryPrizeRes[];
  tickets: LotteryTicketRes[] | null;
  session: SessionRes | null;
  designatedNumbers?: { revealedNumber: number }[];
  designatedWinningNumbers?: { revealedNumber: number }[];
}

/** 詳細頁 API 可能回傳扁平結構，也可能保留舊版 `lottery` 包裝。 */
export interface LotteryDetailRes extends Partial<LotteryRes> {
  lottery?: LotteryRes;
  prizes: LotteryPrizeRes[];
  tickets: LotteryTicketRes[] | null;
  session: SessionRes | null;
  designatedNumbers?: { revealedNumber: number }[];
  designatedWinningNumbers?: { revealedNumber: number }[];
}

export interface SessionRes {
  lotteryId: string;
  isOpener: boolean;
  protectionEndTime: string | null;
  grandPrizesDesignated: boolean;
  myTicketCount: number;
  totalDrawnCount: number;
  remainingCount: number;
  designationDeadline: string | null;
}

// ── Request types ────────────────────────────────────────────────

export interface BrowseCondition {
  keyword?: string;         // 名稱模糊搜尋
  category?: string;        // 篩選分類
  storeId?: string;         // 篩選特定店家
  createdAtStart?: string;
  createdAtEnd?: string;
  // 向後相容欄位（既有元件使用）
  theme?: string;
  status?: LotteryLifecycleStatus;
  tags?: string[];
}

export interface BrowseQueryReq {
  condition?: BrowseCondition;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// ── API functions ─────────────────────────────────────────────────

export const queryBrowseLotteries = async (
  req?: BrowseQueryReq,
): Promise<PaginatedApiResponse<LotteryBrowseListItemRes>> => {
  try {
    const res = await api.post(`${basePath}/list`, req ?? undefined);
    return res.data;
  } catch (e) {
    console.error('LotteryBrowse - queryBrowseLotteries error:', e);
    throw e;
  }
};

export const getBrowseLotteryById = async (
  id: string,
): Promise<ApiResponse<LotteryDetailRes>> => {
  try {
    const res = await api.get(`${basePath}/${id}/detail`);
    return res.data;
  } catch (e) {
    console.error('LotteryBrowse - getBrowseLotteryById error:', e);
    throw e;
  }
};

export const getBrowseLotteriesByStore = async (
  storeId: string,
): Promise<PaginatedApiResponse<LotteryDetailRes>> => {
  try {
    const res = await api.get(`${basePath}/store/${storeId}`);
    return res.data;
  } catch (e) {
    console.error('LotteryBrowse - getBrowseLotteriesByStore error:', e);
    throw e;
  }
};

export const incrementLotteryHotCount = async (
  id: string,
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.post(`${basePath}/${id}/hot`);
    return res.data;
  } catch (e) {
    console.error('LotteryBrowse - incrementLotteryHotCount error:', e);
    throw e;
  }
};
