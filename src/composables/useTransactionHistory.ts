// src/composables/useTransactionHistory.ts
import { ref } from 'vue';
import { getWalletTransactions } from '@/services/consumptionRecordService';
import { useServerPagination } from '@/composables/useServerPagination';
import type { PageResult } from '@/types/api';

export type WalletTransactionType =
  | 'RECHARGE'
  | 'DRAW_GOLD'
  | 'DRAW_BONUS'
  | 'RECYCLE_BONUS'
  | 'REFERRAL_BONUS'
  | 'ADMIN_ADJUST'
  | 'EXPIRE';

const TYPE_LABELS: Record<string, string> = {
  RECHARGE: '儲值',
  DRAW_GOLD: '抽獎（金幣）',
  DRAW_BONUS: '抽獎（紅利）',
  RECYCLE_BONUS: '回收獎品',
  REFERRAL_BONUS: '推薦獎勵',
  ADMIN_ADJUST: '管理員調整',
  EXPIRE: '紅利到期',
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
  referenceId: string | null;
  createdAt: string;
  createdAtText: string;
  isIncome: boolean;
}

const pad2 = (n: number) => String(n).padStart(2, '0');

function formatDateTime(value: any): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function mapRow(x: any): WalletTransactionRow {
  const goldAmount = Number(x.goldAmount ?? 0);
  const bonusAmount = Number(x.bonusAmount ?? 0);
  // fallback: 若後端直接給 amount 也能用
  const amount = goldAmount || bonusAmount || Number(x.amount ?? 0);
  return {
    id: String(x.id ?? ''),
    type: x.type ?? '',
    typeName: x.typeName || (TYPE_LABELS[x.type] ?? x.type ?? ''),
    coinType: x.coinType ?? (bonusAmount > 0 && goldAmount === 0 ? 'BONUS' : 'GOLD'),
    amount,
    goldAmount,
    bonusAmount,
    balanceAfter: Number(x.balanceAfter ?? 0),
    description: x.description ?? '',
    lotteryId: x.lotteryId ?? null,
    lotteryTitle: x.lotteryTitle ?? null,
    referenceId: x.referenceId ?? null,
    createdAt: String(x.createdAt ?? ''),
    createdAtText: formatDateTime(x.createdAt),
    isIncome: amount >= 0,
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
        const data = res.data as PageResult<any> | null;
        const list: any[] = data?.data ?? [];

        items.value = list.map(mapRow);
        sync(data);
      } else {
        error.value = res?.message || '查詢失敗';
        items.value = [];
        sync(null);
      }
    } catch (e: any) {
      error.value = e?.message ?? '查詢失敗，請稍後再試';
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
