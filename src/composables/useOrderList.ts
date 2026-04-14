// src/composables/useOrderList.ts
import { ref } from 'vue';
import { getMyOrders } from '@/services/orderService';

export interface OrderSummary {
  id: string;
  orderNo: string;
  storeName?: string;
  shippingStatus: string;
  shippingStatusName?: string;
  totalItems: number;
  createdAt: string;
}

export function useOrderList() {
  const orders = ref<OrderSummary[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const currentPage = ref(1);
  const pageSize = ref(20);
  const totalRecords = ref(0);
  const statusFilter = ref('');

  async function fetchOrders() {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await getMyOrders({
        page: currentPage.value,
        size: pageSize.value,
        status: statusFilter.value || undefined,
      });
      const data = (res as any)?.data;
      orders.value = data?.content ?? data ?? [];
      totalRecords.value = data?.totalElements ?? orders.value.length;
    } catch (e: any) {
      error.value = '取得訂單列表失敗';
    } finally {
      isLoading.value = false;
    }
  }

  async function changePage(page: number) {
    currentPage.value = page;
    await fetchOrders();
  }

  async function changeStatus(status: string) {
    statusFilter.value = status;
    currentPage.value = 1;
    await fetchOrders();
  }

  return {
    orders,
    isLoading,
    error,
    currentPage,
    pageSize,
    totalRecords,
    statusFilter,
    fetchOrders,
    changePage,
    changeStatus,
  };
}
