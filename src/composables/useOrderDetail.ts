// src/composables/useOrderDetail.ts
import { ref } from 'vue';
import {
  getOrderDetail,
  repayShipping,
  submitShippingInfo,
  type ShippingInfoReq,
} from '@/services/orderService';
import type { PaymentMethodCode } from '@/services/rechargeService';

export function useOrderDetail(orderId: string) {
  const order = ref<any>(null);
  const isLoading = ref(false);
  const isSubmitting = ref(false);
  const error = ref<string | null>(null);
  const submitError = ref<string | null>(null);
  const repayError = ref<string | null>(null);

  const normalizeOrder = (raw: any) => {
    const data = raw?.data?.data ?? raw?.data ?? raw;
    if (!data) return null;
    return {
      id: data.id,
      orderNo: data.orderNo,
      userId: data.userId,
      storeId: data.storeId,
      storeName: data.storeName,
      totalItems: data.totalItems,
      shippingMethod: data.shippingMethod,
      shippingMethodName: data.shippingMethodName,
      shippingStatus: data.shippingStatus,
      shippingStatusName: data.shippingStatusName,
      recipientName: data.recipientName,
      recipientPhone: data.recipientPhone,
      recipientAddress: data.recipientAddress,
      subtotal: data.subtotal ?? 0,
      shippingFee: data.shippingFee ?? 0,
      discount: data.discount ?? 0,
      totalAmount: data.totalAmount ?? 0,
      paymentStatus: data.paymentStatus ?? '',
      paymentMethod: data.paymentMethod ?? '',
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      items: Array.isArray(data.items) ? data.items : [],
    };
  };

  async function fetchDetail() {
    if (!orderId) return;
    isLoading.value = true;
    error.value = null;
    try {
      const res = await getOrderDetail(orderId);
      order.value = normalizeOrder(res);
    } catch (e: any) {
      error.value = '取得訂單詳情失敗';
    } finally {
      isLoading.value = false;
    }
  }

  async function submitShipping(req: ShippingInfoReq): Promise<boolean> {
    if (!orderId) return false;
    isSubmitting.value = true;
    submitError.value = null;
    try {
      await submitShippingInfo(orderId, req);
      await fetchDetail(); // refresh to update status
      return true;
    } catch (e: any) {
      submitError.value = e?.response?.data?.error?.message ?? '提交收件資訊失敗';
      return false;
    } finally {
      isSubmitting.value = false;
    }
  }

  async function repay(paymentMethod: PaymentMethodCode): Promise<string | null> {
    if (!orderId) return null;
    repayError.value = null;
    try {
      const res = await repayShipping(orderId, paymentMethod);
      return res?.data?.paymentUrl ?? null;
    } catch (e: any) {
      repayError.value = e?.response?.data?.error?.message ?? '重新付款失敗';
      return null;
    }
  }

  return {
    order,
    isLoading,
    isSubmitting,
    error,
    submitError,
    repayError,
    fetchDetail,
    submitShipping,
    repay,
  };
}
