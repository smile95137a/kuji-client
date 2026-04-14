// src/composables/useLotteryBrowse.ts
import { ref, reactive } from 'vue';
import {
  queryBrowseLotteries,
  type BrowseQueryReq,
  type BrowseCondition,
} from '@/services/lotteryBrowseService';

export function useLotteryBrowse() {
  const items = ref<any[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const pagination = reactive({
    page: 0,
    size: 12,
    totalPages: 0,
    totalElements: 0,
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
        const data = res.data as any;
        // Support both paginated (content array) and plain array responses
        if (Array.isArray(data)) {
          items.value = data;
          pagination.totalElements = data.length;
          pagination.totalPages = 1;
        } else {
          items.value = data.content ?? [];
          pagination.totalElements = data.totalElements ?? data.content?.length ?? 0;
          pagination.totalPages = data.totalPages ?? 1;
        }
        pagination.page = page;
      }
    } catch (e: any) {
      error.value = e?.message ?? '載入失敗';
    } finally {
      isLoading.value = false;
    }
  }

  async function applyFilter(newFilters: BrowseCondition) {
    filters.value = { ...newFilters };
    await load(0);
  }

  async function nextPage() {
    if (pagination.page < pagination.totalPages - 1) {
      await load(pagination.page + 1);
    }
  }

  async function prevPage() {
    if (pagination.page > 0) {
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
