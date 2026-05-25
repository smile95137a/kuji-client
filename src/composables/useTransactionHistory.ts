import { ref } from 'vue';
import { getWalletTransactions } from '@/services/consumptionRecordService';
import { useServerPagination } from '@/composables/useServerPagination';
import type { PageResult } from '@/types/api';
import { formatDateTime as formatDateTimeUtil } from '@/utils/DateUtils';

export type WalletTransactionType =
  | 'RECHARGE'
  | 'DRAW'
  | 'DRAW_GOLD'
  | 'DRAW_BONUS'
  | 'FREE_DRAW_REFUND'
  | 'RECYCLE_BONUS'
  | 'REFERRAL_BONUS'
  | 'BONUS_GRANT'
  | 'ADMIN_ADJUST'
  | 'EXPIRE';

export const TYPE_LABELS: Record<string, string> = {
  RECHARGE: '儲值',
  DRAW: '抽獎扣款',
  DRAW_GOLD: '抽獎扣款（金幣）',
  DRAW_BONUS: '抽獎扣款（紅利）',
  FREE_DRAW_REFUND: '免單退款',
  RECYCLE_BONUS: '回收紅利',
  REFERRAL_BONUS: '推薦獎勵',
  BONUS_GRANT: '多抽贈送紅利',
  ADMIN_ADJUST: '管理員調整',
  EXPIRE: '點數過期',
};

export interface WalletTransactionRow {
  id: string;
  type: string;
  typeName: string;
  coinType: 'GOLD' | 'BONUS';
  amount: number;
  goldAmount: number;
  bonusAmount: number;
  balanceAfter: number;
  description: string;
  lotteryId: string | null;
  lotteryTitle: string | null;
  drawIndex: number | null;
  ticketNumber: number | null;
  refundAmount: number;
  direction: 'INCOME' | 'EXPENSE';
  createdAt: string;
  createdAtText: string;
  signedGoldAmount: number;
  signedBonusAmount: number;
  signedAmount: number;
}

function formatDateTime(value: unknown): string {
  if (!value) return '';
  return formatDateTimeUtil(value as string, 'YYYY-MM-DD HH:mm') || String(value);
}

function normalizeDirection(value: unknown): 'INCOME' | 'EXPENSE' {
  return String(value ?? '').toUpperCase() === 'INCOME' ? 'INCOME' : 'EXPENSE';
}

function isBrokenLabel(value: unknown): boolean {
  const text = String(value ?? '').trim();
  return !text || text.includes('?');
}

function mapRow(x: any): WalletTransactionRow {
  const direction = normalizeDirection(x.direction);
  const amount = Math.abs(Number(x.amount ?? 0));
  const goldAmount = Math.abs(Number(x.goldAmount ?? 0));
  const bonusAmount = Math.abs(Number(x.bonusAmount ?? 0));
  const sign = direction === 'INCOME' ? 1 : -1;
  const rawType = String(x.type ?? x.transactionType ?? '');
  const rawLabel = String(x.typeName ?? x.transactionTypeName ?? '');

  return {
    id: String(x.id ?? ''),
    type: rawType,
    typeName: isBrokenLabel(rawLabel) ? TYPE_LABELS[rawType] || rawType : rawLabel,
    coinType: String(x.coinType ?? 'GOLD').toUpperCase() === 'BONUS' ? 'BONUS' : 'GOLD',
    amount,
    goldAmount,
    bonusAmount,
    balanceAfter: Number(x.balanceAfter ?? 0),
    description: String(x.description ?? ''),
    lotteryId: x.lotteryId ?? null,
    lotteryTitle: x.lotteryTitle ?? null,
    drawIndex: x.drawIndex != null ? Number(x.drawIndex) : null,
    ticketNumber: x.ticketNumber != null ? Number(x.ticketNumber) : null,
    refundAmount: Math.abs(Number(x.refundAmount ?? 0)),
    direction,
    createdAt: String(x.createdAt ?? ''),
    createdAtText: formatDateTime(x.createdAt),
    signedGoldAmount: goldAmount > 0 ? sign * goldAmount : 0,
    signedBonusAmount: bonusAmount > 0 ? sign * bonusAmount : 0,
    signedAmount: sign * amount,
  };
}

export function useTransactionHistory() {
  const items = ref<WalletTransactionRow[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const {
    page,
    size,
    total,
    totalPages,
    hasNext,
    hasPrevious,
    sync,
  } = useServerPagination(10);

  const typeFilter = ref('');
  const dateStart = ref('');
  const dateEnd = ref('');

  async function fetch() {
    isLoading.value = true;
    error.value = null;
    try {
      const req: any = {
        condition: {
          type: typeFilter.value || undefined,
          createdAtStart: dateStart.value || undefined,
          createdAtEnd: dateEnd.value || undefined,
        },
        page: page.value,
        size: size.value,
        sortOrder: 'DESC',
      };

      const res = await getWalletTransactions(req);
      if (res?.success) {
        const data = (res.data as PageResult<any> | null) ?? null;
        const list: any[] = Array.isArray(data?.data) ? data!.data : [];
        items.value = list.map(mapRow);
        sync(data);
      } else {
        error.value = res?.message || '讀取交易流水失敗';
        items.value = [];
        sync(null);
      }
    } catch (e: any) {
      error.value = e?.message ?? '讀取交易流水失敗，請稍後再試';
      items.value = [];
      sync(null);
    } finally {
      isLoading.value = false;
    }
  }

  async function search() {
    page.value = 1;
    await fetch();
  }

  async function reset() {
    typeFilter.value = '';
    dateStart.value = '';
    dateEnd.value = '';
    page.value = 1;
    await fetch();
  }

  function goToPage(p: number) {
    page.value = p;
    return fetch();
  }

  return {
    items,
    isLoading,
    error,
    totalItems: total,
    hasNext,
    hasPrevious,
    totalPages,
    size,
    page,
    typeFilter,
    dateStart,
    dateEnd,
    TYPE_LABELS,
    fetch,
    search,
    reset,
    goToPage,
  };
}
