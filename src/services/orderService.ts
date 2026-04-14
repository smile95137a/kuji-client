// services/orderService.ts
import { api } from './FrontAPI';

const basePath = '/order';

interface RequestData {
  [key: string]: any;
}

/** 前台 - 查詢我的訂單列表 POST /api/order/list */
export const getMyOrders = async (
  req?: RequestData,
): Promise<ApiResponse<any>> => {
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
