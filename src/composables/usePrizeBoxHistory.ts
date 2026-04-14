// src/composables/usePrizeBoxHistory.ts
import { ref } from 'vue';
import { getPrizeBoxHistory } from '@/services/prizeBoxService';

export interface PrizeBoxHistoryItem {
  id: string;
  prizeName: string;
  prizeImageUrl?: string;
  lotteryTitle?: string;
  storeName?: string;
  status: string;
  statusName?: string;
  processedAt?: string;
  createdAt: string;
}

export function usePrizeBoxHistory() {
  const records = ref<PrizeBoxHistoryItem[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const currentPage = ref(1);
  const pageSize = ref(20);
  const totalRecords = ref(0);
  const statusFilter = ref<'' | 'SHIPPED' | 'RECYCLED'>('');

  async function fetchHistory() {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await getPrizeBoxHistory({
        page: currentPage.value,
        size: pageSize.value,
        status: statusFilter.value || undefined,
      });
      const data = (res as any)?.data;
      records.value = data?.content ?? data ?? [];
      totalRecords.value = data?.totalElements ?? records.value.length;
    } catch (e: any) {
      error.value = '取得歷史紀錄失敗';
    } finally {
      isLoading.value = false;
    }
  }

  async function changePage(page: number) {
    currentPage.value = page;
    await fetchHistory();
  }

  async function changeStatusFilter(status: typeof statusFilter.value) {
    statusFilter.value = status;
    currentPage.value = 1;
    await fetchHistory();
  }

  return {
    records,
    isLoading,
    error,
    currentPage,
    pageSize,
    totalRecords,
    statusFilter,
    fetchHistory,
    changePage,
    changeStatusFilter,
  };
}
