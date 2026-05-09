// src/services/emergencyAnnouncementService.ts
import { api } from './FrontAPI';

const basePath = '/emergency-announcement';

interface RequestData {
  [key: string]: any;
}

export interface EmergencyAnnouncementRes {
  id: string;
  title: string;
  content: string;
  announcementType: 'MAINTENANCE' | 'UPDATE' | 'NOTICE' | string;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | string;
  displayStartTime: string | null;
  displayEndTime: string | null;
  maintenanceStartTime: string | null;
  maintenanceEndTime: string | null;
  forceShow: boolean;
  sortOrder: number;
  createdBy?: string | null;
  createdAt?: string | null;
  updatedBy?: string | null;
  updatedAt?: string | null;
}

export const getActiveEmergencyAnnouncements = async (
  req?: RequestData,
): Promise<ApiResponse<EmergencyAnnouncementRes[]>> => {
  try {
    const res = await api.get(`${basePath}/active`, {
      params: req ?? undefined,
    });

    return res.data;
  } catch (e) {
    console.error(
      'EmergencyAnnouncement - getActiveEmergencyAnnouncements error:',
      e,
    );
    throw e;
  }
};
