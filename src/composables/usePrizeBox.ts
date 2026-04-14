// src/composables/usePrizeBox.ts
import { ref, computed } from 'vue';
import { useMemberWalletStore } from '@/stores/memberWallet';
import {
  getMyPrizeBox,
  getPrizeBoxSummaryByStore,
  shipPrizeBoxItems,
  recyclePrizeBoxItems,
} from '@/services/prizeBoxService';

export interface PrizeBoxItem {
  id: string;
  prizeName: string;
  prizeImageUrl?: string;
  prizeLevel?: string;
  lotteryTitle?: string;
  storeName?: string;
  storeId?: string;
  status: string;
  createdAt: string;
}

export function usePrizeBox() {
  const walletStore = useMemberWalletStore();

  const items = ref<PrizeBoxItem[]>([]);
  const summary = ref<any[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const selectedIds = ref<Set<string>>(new Set());

  const availableItems = computed(() =>
    items.value.filter((i) => i.status === 'AVAILABLE' || i.status === 'IN_BOX'),
  );

  function toggleSelect(id: string) {
    if (selectedIds.value.has(id)) {
      selectedIds.value.delete(id);
    } else {
      selectedIds.value.add(id);
    }
    // trigger reactivity
    selectedIds.value = new Set(selectedIds.value);
  }

  function clearSelection() {
    selectedIds.value = new Set();
  }

  async function fetchItems() {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await getMyPrizeBox();
      items.value = (res as any)?.data ?? (res as any) ?? [];
    } catch (e: any) {
      error.value = '取得賞品盒失敗';
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchSummary() {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await getPrizeBoxSummaryByStore();
      summary.value = (res as any)?.data ?? (res as any) ?? [];
    } catch (e: any) {
      error.value = '取得摘要失敗';
    } finally {
      isLoading.value = false;
    }
  }

  async function ship(req: { prizeBoxIds: string[]; [key: string]: any }): Promise<boolean> {
    isLoading.value = true;
    error.value = null;
    try {
      await shipPrizeBoxItems(req);
      await fetchItems();
      clearSelection();
      return true;
    } catch (e: any) {
      error.value = e?.response?.data?.error?.message ?? '出貨請求失敗';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function recycle(ids: string[]): Promise<boolean> {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await recyclePrizeBoxItems({ prizeBoxIds: ids });
      // Sync wallet bonus
      await walletStore.loadMe();
      await fetchItems();
      clearSelection();
      return true;
    } catch (e: any) {
      error.value = e?.response?.data?.error?.message ?? '回收失敗';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    items,
    summary,
    availableItems,
    selectedIds,
    isLoading,
    error,
    toggleSelect,
    clearSelection,
    fetchItems,
    fetchSummary,
    ship,
    recycle,
  };
}
