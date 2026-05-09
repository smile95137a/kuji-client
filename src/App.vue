<!-- src/App.vue -->
<template>
  <router-view />

  <BaseOverlay />
  <FloatingActionDrawer />
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import BaseOverlay from '@/components/common/BaseOverlay.vue';
import FloatingActionDrawer from '@/components/FloatingActionDrawer.vue';

import {
  getActiveEmergencyAnnouncements,
  type EmergencyAnnouncementRes,
} from '@/services/emergencyAnnouncementService';

// initAuth() is now called in main.ts before the router is mounted,
// ensuring the silent refresh completes before any route guard runs.

const router = useRouter();
const route = useRoute();

const MAINTENANCE_MODE_KEY = 'isMaintenanceMode';
const MAINTENANCE_ANNOUNCEMENT_KEY = 'maintenanceAnnouncement';

const normalizeList = (res: any): EmergencyAnnouncementRes[] => {
  if (Array.isArray(res)) return res;

  const data = res?.data ?? res;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.list)) return data.list;

  return [];
};

const setMaintenanceMode = (
  enabled: boolean,
  announcement?: EmergencyAnnouncementRes | null,
) => {
  if (enabled) {
    sessionStorage.setItem(MAINTENANCE_MODE_KEY, 'Y');

    if (announcement) {
      sessionStorage.setItem(
        MAINTENANCE_ANNOUNCEMENT_KEY,
        JSON.stringify(announcement),
      );
    } else {
      sessionStorage.removeItem(MAINTENANCE_ANNOUNCEMENT_KEY);
    }

    return;
  }

  sessionStorage.removeItem(MAINTENANCE_MODE_KEY);
  sessionStorage.removeItem(MAINTENANCE_ANNOUNCEMENT_KEY);
};

const isMaintenanceMode = () => {
  return sessionStorage.getItem(MAINTENANCE_MODE_KEY) === 'Y';
};

const redirectToMaintenance = async () => {
  if (route.name === 'Maintenance') return;

  await router.replace({
    name: 'Maintenance',
  });
};

const leaveMaintenanceIfNeeded = async () => {
  if (route.name !== 'Maintenance') return;

  await router.replace({
    name: 'Home',
  });
};

const checkEmergencyAnnouncement = async () => {
  try {
    const res = await getActiveEmergencyAnnouncements();

    /**
     * API 明確回失敗，代表服務可能異常，進維修頁。
     */
    if (res?.success === false) {
      setMaintenanceMode(true, null);
      await redirectToMaintenance();
      return;
    }

    const list = normalizeList(res);

    /**
     * 沒有有效公告，代表正常開站。
     */
    if (list.length === 0) {
      setMaintenanceMode(false, null);
      await leaveMaintenanceIfNeeded();
      return;
    }

    /**
     * 只要有 ACTIVE 公告，不管 UPDATE / MAINTENANCE / NOTICE，
     * 都導去維修頁。
     */
    const activeAnnouncement = list.find((item) => item.status === 'ACTIVE');

    if (activeAnnouncement) {
      setMaintenanceMode(true, activeAnnouncement);
      await redirectToMaintenance();
      return;
    }

    /**
     * 有資料但沒有 ACTIVE，正常進網站。
     */
    setMaintenanceMode(false, null);
    await leaveMaintenanceIfNeeded();
  } catch (error) {
    console.error('[App] checkEmergencyAnnouncement failed:', error);

    /**
     * API 打不到、後端掛掉、401、500，直接進維修頁。
     */
    setMaintenanceMode(true, null);
    await redirectToMaintenance();
  }
};

/**
 * 維修模式下，任何路由都不能進。
 * 除了 Maintenance 頁。
 */
watch(
  () => route.fullPath,
  async () => {
    if (!isMaintenanceMode()) return;
    if (route.name === 'Maintenance') return;

    await redirectToMaintenance();
  },
);

onMounted(async () => {
  await checkEmergencyAnnouncement();
});
</script>

<style scoped>
.layout__body {
  display: flex;
}

.layout__main {
  flex: 1;
}
</style>
