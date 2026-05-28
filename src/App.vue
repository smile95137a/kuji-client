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
import { ichibanInfoDialog } from './utils/dialog/ichibanInfoDialog';
import { useOverlayStore } from './stores/overlay';

const overlay = useOverlayStore();
const router = useRouter();
const route = useRoute();

const MAINTENANCE_MODE_KEY = 'isMaintenanceMode';
const MAINTENANCE_ANNOUNCEMENT_KEY = 'maintenanceAnnouncement';
const NOTICE_SEEN_PREFIX = 'emergencyNoticeSeen:';
const BLOCKING_ANNOUNCEMENT_TYPES = new Set(['MAINTENANCE', 'UPDATE']);

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

const getAnnouncementType = (
  announcement?: EmergencyAnnouncementRes | null,
) => {
  return String(announcement?.announcementType ?? '')
    .trim()
    .toUpperCase();
};

const isActiveAnnouncement = (announcement: EmergencyAnnouncementRes) => {
  return announcement.status === 'ACTIVE';
};

const hasSeenNotice = (announcement: EmergencyAnnouncementRes) => {
  return (
    sessionStorage.getItem(`${NOTICE_SEEN_PREFIX}${announcement.id}`) === 'Y'
  );
};

const markNoticeSeen = (announcement: EmergencyAnnouncementRes) => {
  sessionStorage.setItem(`${NOTICE_SEEN_PREFIX}${announcement.id}`, 'Y');
};

const showNoticeAnnouncements = async (list: EmergencyAnnouncementRes[]) => {
  const notices = list
    .filter(isActiveAnnouncement)
    .filter((item) => getAnnouncementType(item) === 'NOTICE')
    .filter((item) => !hasSeenNotice(item))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  try {
    overlay.open('ichiban-info', false);
    for (const notice of notices) {
      markNoticeSeen(notice);
      await ichibanInfoDialog({
        title: notice.title || '重要公告',
        content: notice.content || '請留意最新公告內容。',
      });
    }
  } finally {
    overlay.close();
  }
};

const checkEmergencyAnnouncement = async () => {
  try {
    const res = await getActiveEmergencyAnnouncements();

    if (res?.success === false) {
      setMaintenanceMode(false, null);
      await leaveMaintenanceIfNeeded();
      return;
    }

    const list = normalizeList(res);

    if (list.length === 0) {
      setMaintenanceMode(false, null);
      await leaveMaintenanceIfNeeded();
      return;
    }

    const blockingAnnouncement = list.find((item) => {
      return (
        isActiveAnnouncement(item) &&
        BLOCKING_ANNOUNCEMENT_TYPES.has(getAnnouncementType(item))
      );
    });

    if (blockingAnnouncement) {
      setMaintenanceMode(true, blockingAnnouncement);
      await redirectToMaintenance();
      return;
    }

    setMaintenanceMode(false, null);
    await leaveMaintenanceIfNeeded();
    await showNoticeAnnouncements(list);
  } catch (error) {
    console.error('[App] checkEmergencyAnnouncement failed:', error);
    setMaintenanceMode(false, null);
    await leaveMaintenanceIfNeeded();
  }
};

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
