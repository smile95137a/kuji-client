// src/composables/useDrawFlow.ts
import { ref } from 'vue';
import { drawLottery, type DrawResult } from '@/services/lotteryDrawService';
import { useMemberWalletStore } from '@/stores/memberWallet';

export interface DrawNormalResult {
  type: 'normal';
  results: DrawResult[];
  protectionEndTime: string | null;
  remainingGold: number;
  remainingBonus: number;
}

export interface DrawDesignationRequiredResult {
  type: 'designationRequired';
  availableNumbers: string[];
  grandPrizes: Array<{
    prizeId: string;
    prizeName: string;
    prizeLevel: string;
    quantity: number;
    prizeImageUrl?: string | null;
  }>;
}

export interface DrawDesignationPendingResult {
  type: 'designationPending';
  message: string;
  openerDeadline: string;
}

export interface DrawErrorResult {
  type: 'error';
  message: string;
}

export type DrawFlowResult =
  | DrawNormalResult
  | DrawDesignationRequiredResult
  | DrawDesignationPendingResult
  | DrawErrorResult;

export function useDrawFlow(lotteryId: string | { value: string }) {
  const isDrawing = ref(false);
  const memberWallet = useMemberWalletStore();

  const resolveId = () =>
    typeof lotteryId === 'string' ? lotteryId : lotteryId.value;

  async function draw(payload: {
    tickets?: string[];
    count?: number;
  }): Promise<DrawFlowResult> {
    if (isDrawing.value) {
      return { type: 'error', message: '抽獎進行中，請稍候' };
    }

    isDrawing.value = true;
    try {
      const res = await drawLottery(resolveId(), payload);

      if (!res?.success) {
        return {
          type: 'error',
          message: res?.message ?? '抽獎失敗，請稍後再試',
        };
      }

      const data = res.data as any;

      // Case 2: Opener needs to designate grand prize positions
      if (data?.designationRequired === true) {
        return {
          type: 'designationRequired',
          availableNumbers: data.availableNumbers ?? [],
          grandPrizes: data.grandPrizes ?? [],
        };
      }

      // Case 3: Non-opener waiting for designation
      if (
        data?.designationPending === true ||
        data?.awaitingDesignation === true
      ) {
        return {
          type: 'designationPending',
          message: data.message ?? '開套者正在指定大獎位置，請稍候',
          openerDeadline: data.openerDeadline ?? '',
        };
      }

      // Case 1: Normal draw response
      const results: DrawResult[] = Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data)
          ? data
          : [];

      // Update wallet state with remaining balances from server
      const remainingGold = Number(data?.remainingGold ?? 0);
      const remainingBonus = Number(data?.remainingBonus ?? 0);
      if (data?.remainingGold !== undefined) {
        memberWallet.setMe({
          ...(memberWallet.me ?? {}),
          goldCoins: remainingGold,
          bonusCoins: remainingBonus,
        });
      }

      return {
        type: 'normal',
        results,
        protectionEndTime: data?.protectionEndTime ?? null,
        remainingGold,
        remainingBonus,
      };
    } finally {
      isDrawing.value = false;
    }
  }

  return { isDrawing, draw };
}
