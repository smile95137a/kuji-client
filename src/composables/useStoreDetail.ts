import { computed, ref, watch } from 'vue';
import type { RouteLocationNormalizedLoaded } from 'vue-router';
import { useServerPagination } from '@/composables/useServerPagination';
import {
  getStoreDetail,
  getStoreProducts,
  type StoreDetail,
  type StoreProduct,
} from '@/services/storeService';

export function useStoreDetail(route: RouteLocationNormalizedLoaded) {
  const store = ref<StoreDetail | null>(null);
  const products = ref<StoreProduct[]>([]);
  const loading = ref(true);
  const productsLoading = ref(true);
  const error = ref('');

  const { page, size, total, totalPages, hasNext, hasPrevious, sync } =
    useServerPagination(12);

  const storeId = computed(() => String(route.params.id ?? ''));

  const loadStore = async () => {
    loading.value = true;
    error.value = '';

    try {
      const result = await getStoreDetail(storeId.value);
      store.value = result?.data ?? null;

      if (!store.value) {
        error.value = '找不到此店家';
      }
    } catch (err: any) {
      const status = err?.response?.status;

      if (status === 404) {
        error.value = '找不到此店家';
      } else if (status === 403) {
        error.value = '您沒有權限查看此店家';
      } else {
        error.value = '載入失敗，請稍後再試';
      }
    } finally {
      loading.value = false;
    }
  };

  const loadProducts = async () => {
    productsLoading.value = true;

    try {
      const result = await getStoreProducts(storeId.value, {
        page: page.value,
        size: size.value,
      });
      const pageResult = result?.data;
      products.value = pageResult?.data ?? [];
      sync(pageResult);
    } catch (err) {
      console.error('StoreDetail - loadProducts error:', err);
      products.value = [];
      sync(null);
    } finally {
      productsLoading.value = false;
    }
  };

  const reload = async () => {
    await loadStore();
    await loadProducts();
  };

  watch(
    storeId,
    async () => {
      page.value = 1;
      await reload();
    },
    { immediate: true },
  );

  return {
    store,
    products,
    loading,
    productsLoading,
    error,
    page,
    size,
    total,
    totalPages,
    hasNext,
    hasPrevious,
    loadProducts,
  };
}
