// services/orderService.ts
import { api } from './FrontAPI';

const basePath = '/api/order';

interface RequestData {
  [key: string]: any;
}

/** 前台 - 查詢我的訂單列表 POST /api/order/list */
export const getMyOrders = async (
  req?: RequestData
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
  req?: RequestData
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.get(`${basePath}/${orderId}`, {
      params: req ?? undefined,
    });
    return res.data;
  } catch (e) {
    console.error('Order - getOrderDetail error:', e);
    throw e;
  }
};
