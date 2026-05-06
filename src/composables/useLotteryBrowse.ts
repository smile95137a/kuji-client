// src/composables/useLotteryBrowse.ts
import { ref, reactive } from 'vue';
import {
  queryBrowseLotteries,
  type BrowseQueryReq,
  type BrowseCondition,
} from '@/services/lotteryBrowseService';
import type { PageResult } from '@/types/api';

export function useLotteryBrowse() {
  const items = ref<any[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const pagination = reactive({
    page: 1,
    size: 12,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  });

  const filters = ref<BrowseCondition>({});

  async function load(page = pagination.page) {
    isLoading.value = true;
    error.value = null;
    try {
      const req: BrowseQueryReq = {
        condition: filters.value,
        page,
        size: pagination.size,
      };
      const res = await queryBrowseLotteries(req);
      if (res?.success && res.data) {
        const data = res.data as PageResult<any>;
        items.value = data.data ?? [];
        pagination.page = data.page ?? page;
        pagination.size = data.size ?? pagination.size;
        pagination.total = data.total ?? 0;
        pagination.totalPages = data.totalPages ?? 1;
        pagination.hasNext = Boolean(data.hasNext);
        pagination.hasPrevious = Boolean(data.hasPrevious);
      }
    } catch (e: any) {
      error.value = e?.message ?? '載入失敗';
    } finally {
      isLoading.value = false;
    }
  }

  async function applyFilter(newFilters: BrowseCondition) {
    filters.value = { ...newFilters };
    pagination.page = 1;
    await load(1);
  }

  async function nextPage() {
    if (pagination.hasNext && pagination.page < pagination.totalPages) {
      await load(pagination.page + 1);
    }
  }

  async function prevPage() {
    if (pagination.hasPrevious && pagination.page > 1) {
      await load(pagination.page - 1);
    }
  }

  async function goToPage(page: number) {
    await load(page);
  }

  return {
    items,
    isLoading,
    error,
    filters,
    pagination,
    load,
    applyFilter,
    nextPage,
    prevPage,
    goToPage,
  };
}
