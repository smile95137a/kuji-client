// services/orderService.ts
import { api } from './FrontAPI';
import type { ApiResponse, PaginatedApiResponse } from '@/types/api';
import type { PaymentMethodCode } from './rechargeService';

const basePath = '/order';

interface RequestData {
  [key: string]: any;
}

export interface OrderListRow {
  id: string;
  orderNo: string;
  totalAmount: number;
  createdAt: string;
  shippingStatus: string;
  shippingStatusName?: string;
  payMethodName?: string;
}

export interface OrderPaymentInitRes {
  orderId: string;
  orderNumber: string;
  shippingFee: number;
  paymentStatus: string;
  paymentMethod?: PaymentMethodCode | string;
  paymentUrl: string | null;
  submitMethod?: string | null;
  actionUrl?: string | null;
  formFields?: Record<string, string> | null;
  gatewayTradeNo: string | null;
}

/** 前台 - 查詢我的訂單列表 POST /api/order/list */
export const getMyOrders = async (
  req?: RequestData,
): Promise<PaginatedApiResponse<OrderListRow>> => {
  try {
    const res = await api.post(`${basePath}/list`, req ?? null);
    return res.data;
  } catch (e) {
    console.error('Order - getMyOrders error:', e);
    throw e;
  }
};

/** 前台 - 查詢訂單詳情 GET /api/order/{orderId} */
export const getOrderDetail = async (
  orderId: string,
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}/${orderId}`);
    return res.data;
  } catch (e) {
    console.error('Order - getOrderDetail error:', e);
    throw e;
  }
};

/** 前台 - 補填收件資訊 POST /order/{orderId}/shipping-info */
export interface ShippingInfoReq {
  recipientName: string;
  recipientPhone: string;
  city: string;
  district: string;
  address: string;
  zipCode?: string;
}

export const submitShippingInfo = async (
  orderId: string,
  req: ShippingInfoReq,
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.post(`${basePath}/${orderId}/shipping-info`, req);
    return res.data;
  } catch (e) {
    console.error('Order - submitShippingInfo error:', e);
    throw e;
  }
};

export const repayShipping = async (
  orderId: string,
  paymentMethod: PaymentMethodCode,
): Promise<ApiResponse<OrderPaymentInitRes>> => {
  try {
    const res = await api.post(`${basePath}/${orderId}/repay`, null, {
      params: { paymentMethod },
    });
    return res.data;
  } catch (e) {
    console.error('Order - repayShipping error:', e);
    throw e;
  }
};

export const getPaymentGroupOrders = async (
  merchantOrderNo: string,
): Promise<ApiResponse<OrderPaymentInitRes[]>> => {
  try {
    const res = await api.get(`${basePath}/payment-group/${merchantOrderNo}`);
    return res.data;
  } catch (e) {
    console.error('Order - getPaymentGroupOrders error:', e);
    throw e;
  }
};
