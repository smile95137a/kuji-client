// src/composables/useTransactionHistory.ts
import { ref, computed } from 'vue';
import { getMyWalletTransactions } from '@/services/walletService';

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
  balanceAfter: number;
  description: string;
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
  const amount = Number(x.amount ?? 0);
  return {
    id: String(x.id ?? ''),
    type: x.type ?? '',
    typeName: TYPE_LABELS[x.type] ?? x.type ?? '',
    coinType: x.coinType ?? 'GOLD',
    amount,
    balanceAfter: Number(x.balanceAfter ?? 0),
    description: x.description ?? '',
    referenceId: x.referenceId ?? null,
    createdAt: String(x.createdAt ?? ''),
    createdAtText: formatDateTime(x.createdAt),
    isIncome: amount >= 0,
  };
}

const PAGE_SIZE = 10;

export function useTransactionHistory() {
  const items = ref<WalletTransactionRow[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const totalItems = ref(0);
  const page = ref(1);

  const typeFilter = ref('');
  const dateStart = ref('');
  const dateEnd = ref('');

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(totalItems.value / PAGE_SIZE)),
  );

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
        size: PAGE_SIZE,
        sortOrder: 'DESC',
      };

      const res = await getMyWalletTransactions(req);

      if (res?.success) {
        const data = res.data as any;
        const list: any[] = Array.isArray(data)
          ? data
          : (data?.content ?? data?.list ?? data?.records ?? []);
        const total: number =
          data?.totalElements ?? data?.total ?? data?.totalRecords ?? list.length;

        items.value = list.map(mapRow);
        totalItems.value = total;
      } else {
        error.value = res?.message || '查詢失敗';
        items.value = [];
        totalItems.value = 0;
      }
    } catch (e: any) {
      error.value = e?.message ?? '查詢失敗，請稍後再試';
      items.value = [];
      totalItems.value = 0;
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
    fetch();
  }

  return {
    items,
    isLoading,
    error,
    totalItems,
    totalPages,
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
