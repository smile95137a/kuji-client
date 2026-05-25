import { api } from './FrontAPI';

export interface StoreMapReq {
  shippingMethod: string;
  returnUrl: string;
}

export interface StoreMapRes {
  mapUrl: string;
}

export const createStoreMapUrl = async (
  req: StoreMapReq,
): Promise<StoreMapRes> => {
  const res = await api.post('/logistics/store-map', req);
  return res.data?.data ?? res.data;
};
