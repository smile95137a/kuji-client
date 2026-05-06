import { computed, ref } from 'vue';
import type { PageResult } from '@/types/api';

export function useServerPagination(defaultSize = 12) {
  const page = ref(1);
  const size = ref(defaultSize);
  const total = ref(0);
  const totalPages = ref(1);
  const hasNext = ref(false);
  const hasPrevious = ref(false);

  const canGoFirst = computed(() => page.value > 1 && hasPrevious.value);
  const canGoPrev = computed(() => page.value > 1 && hasPrevious.value);
  const canGoNext = computed(() => hasNext.value || page.value < totalPages.value);
  const canGoLast = computed(() => page.value < totalPages.value && hasNext.value);

  function resetPage() {
    page.value = 1;
  }

  function setPage(nextPage: number) {
    page.value = Math.max(1, nextPage);
  }

  function sync(result: PageResult<unknown> | null | undefined) {
    if (!result) {
      total.value = 0;
      totalPages.value = 1;
      hasNext.value = false;
      hasPrevious.value = false;
      return;
    }

    page.value = result.page ?? page.value;
    size.value = result.size ?? size.value;
    total.value = result.total ?? 0;
    totalPages.value = Math.max(1, result.totalPages ?? 1);
    hasNext.value = Boolean(result.hasNext);
    hasPrevious.value = Boolean(result.hasPrevious);
  }

  return {
    page,
    size,
    total,
    totalPages,
    hasNext,
    hasPrevious,
    canGoFirst,
    canGoPrev,
    canGoNext,
    canGoLast,
    resetPage,
    setPage,
    sync,
  };
}
