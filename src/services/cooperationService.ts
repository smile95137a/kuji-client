// src/services/cooperationService.ts
import { api } from './FrontAPI';

const basePath = '/cooperation-inquiry';

interface RequestData {
  [key: string]: any;
}

export interface CooperationInquiryReq {
  company?: string;
  name: string;
  email: string;
  phone?: string;
  type: 'IP' | 'SUPPLY' | 'CHANNEL' | 'MARKETING' | string;
  message: string;
}

/** 前台 - 送出合作洽談表單 */
export const submitCooperationInquiry = async (
  req: CooperationInquiryReq,
): Promise<ApiResponse<any>> => {
  try {
    const res = await api.post(`${basePath}`, req);
    return res.data;
  } catch (e) {
    console.error('Cooperation - submitCooperationInquiry error:', e);
    throw e;
  }
};
