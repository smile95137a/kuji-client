<!-- src/views/Maintenance.vue -->
<template>
  <main class="maintenance-page">
    <section class="maintenance-page__card">
      <div class="maintenance-page__brand">
        <img class="maintenance-page__logo" :src="weblogo" alt="STARO" />
      </div>

      <div class="maintenance-page__iconWrap">
        <div class="maintenance-page__icon">
          <font-awesome-icon :icon="mainIcon" />
        </div>
      </div>

      <p class="maintenance-page__tag">
        {{ announcementTypeText(announcement?.announcementType) }}
      </p>

      <h1 class="maintenance-page__title">
        {{ pageTitle }}
      </h1>

      <p class="maintenance-page__desc">
        {{ pageDescription }}
      </p>

      <div v-if="announcement" class="maintenance-page__notice">
        <p class="maintenance-page__noticeTitle">
          {{ formatAnnouncementTitle(announcement.title) }}
        </p>

        <div class="maintenance-page__noticeContent">
          <p
            v-for="line in formatAnnouncementContentLines(announcement.content)"
            :key="line"
          >
            {{ line }}
          </p>
        </div>

        <p
          v-if="
            announcement.maintenanceStartTime || announcement.maintenanceEndTime
          "
          class="maintenance-page__time"
        >
          <font-awesome-icon icon="fa-clock" />

          <span>
            {{ formatDateTime(announcement.maintenanceStartTime) }}
            ～
            {{ formatDateTime(announcement.maintenanceEndTime) }}
          </span>
        </p>
      </div>

      <div v-else class="maintenance-page__notice">
        <p class="maintenance-page__noticeTitle">服務暫時無法使用</p>

        <div class="maintenance-page__noticeContent">
          <p>目前系統連線異常或正在維護中</p>
          <p>請稍後重新整理頁面</p>
        </div>
      </div>

      <button class="maintenance-page__button" type="button" @click="reload">
        <font-awesome-icon icon="fa-rotate-right" />
        <span>重新整理</span>
      </button>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import weblogo from '@/assets/image/weblogo.png';

interface EmergencyAnnouncement {
  id?: string;
  title?: string;
  content?: string;
  announcementType?: string;
  maintenanceStartTime?: string | null;
  maintenanceEndTime?: string | null;
}

const announcement = computed<EmergencyAnnouncement | null>(() => {
  try {
    const raw = sessionStorage.getItem('maintenanceAnnouncement');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
});

const announcementTypeText = (type?: string) => {
  if (type === 'MAINTENANCE') return '維修公告';
  if (type === 'UPDATE') return '版本更新';
  if (type === 'NOTICE') return '重要公告';

  return '系統公告';
};

const pageTitle = computed(() => {
  const type = announcement.value?.announcementType;

  if (type === 'UPDATE') return '系統更新中';
  if (type === 'MAINTENANCE') return '系統維護中';
  if (type === 'NOTICE') return '系統暫停服務';

  return '系統維護中';
});

const pageDescription = computed(() => {
  const type = announcement.value?.announcementType;

  if (type === 'UPDATE') {
    return 'STARO 正在進行版本更新，更新完成後將提供更穩定的服務體驗。';
  }

  if (type === 'MAINTENANCE') {
    return 'STARO 目前正在維護中，暫時無法使用服務，造成不便敬請見諒。';
  }

  return 'STARO 目前暫時無法使用，請稍後再試。';
});

const mainIcon = computed(() => {
  return 'fa-screwdriver-wrench';
});

const formatDateTime = (value?: string | null) => {
  if (!value) return '-';

  return String(value).replace('T', ' ').slice(0, 16);
};

const formatAnnouncementTitle = (title?: string) => {
  if (!title) return '系統公告';

  return String(title)
    .replace(/\s+[0-9]{2}$/, '')
    .trim();
};

const formatAnnouncementContentLines = (content?: string) => {
  if (!content) return [];

  const lines = String(content)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const allowedPrefixes = ['影響範圍：', '公告類型：'];

  const filtered = lines.filter((line) =>
    allowedPrefixes.some((prefix) => line.startsWith(prefix)),
  );

  return filtered.length > 0 ? filtered : ['系統目前正在維護或更新中'];
};

const reload = () => {
  window.location.reload();
};
</script>

<style scoped lang="scss">
.maintenance-page {
  min-height: 100vh;
  padding: 24px;

  display: flex;
  align-items: center;
  justify-content: center;

  position: relative;
  overflow: hidden;

  background:
    radial-gradient(circle at 8% 0%, rgba(180, 51, 37, 0.06), transparent 30%),
    radial-gradient(
      circle at 92% 10%,
      rgba(229, 166, 87, 0.12),
      transparent 28%
    ),
    #fff;

  color: #241610;

  --primary: #b43325;
  --primary-dark: #3f2412;
  --primary-soft: rgba(180, 51, 37, 0.1);
  --gold: #e4aa43;
  --gold-soft: rgba(228, 170, 67, 0.18);
  --cream: #fff8ef;
  --text: #241610;
  --text-soft: rgba(36, 22, 16, 0.58);
  --line: rgba(63, 36, 18, 0.1);
}

.maintenance-page::before {
  content: '';
  position: absolute;
  right: -110px;
  top: -120px;
  width: 320px;
  height: 320px;
  border-radius: 999px;
  background: rgba(180, 51, 37, 0.08);
  pointer-events: none;
}

.maintenance-page::after {
  content: '';
  position: absolute;
  left: -120px;
  bottom: -140px;
  width: 340px;
  height: 340px;
  border-radius: 999px;
  background: rgba(228, 170, 67, 0.12);
  pointer-events: none;
}

.maintenance-page__card {
  position: relative;
  z-index: 1;

  width: min(560px, 100%);
  overflow: hidden;
  padding: 42px 38px 34px;

  display: flex;
  flex-direction: column;
  align-items: center;

  text-align: center;

  border-radius: 34px;
  background:
    radial-gradient(circle at 92% 8%, rgba(180, 51, 37, 0.1), transparent 34%),
    linear-gradient(180deg, #fff8ef 0%, #ffffff 66%);

  border: 1px solid var(--line);
  box-shadow: 0 26px 70px rgba(63, 36, 18, 0.12);
}

.maintenance-page__brand {
  width: 100%;
  margin-bottom: 18px;

  display: flex;
  justify-content: center;
}

.maintenance-page__logo {
  width: min(210px, 72%);
  height: auto;
  display: block;
  filter: drop-shadow(0 14px 22px rgba(63, 36, 18, 0.14));
}

.maintenance-page__iconWrap {
  width: 86px;
  height: 86px;
  padding: 8px;
  border-radius: 999px;

  background: var(--gold-soft);
  border: 1px solid rgba(228, 170, 67, 0.24);
}

.maintenance-page__icon {
  width: 100%;
  height: 100%;
  border-radius: 999px;

  display: grid;
  place-items: center;

  background: linear-gradient(135deg, var(--primary) 0%, #d66b42 100%);
  color: #fff;

  font-size: 28px;
  box-shadow: 0 14px 30px rgba(180, 51, 37, 0.22);
}

.maintenance-page__tag {
  min-height: 28px;
  padding: 0 14px;
  border-radius: 999px;
  margin: 20px 0 12px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  background: rgba(180, 51, 37, 0.1);
  color: var(--primary);

  font-size: 13px;
  font-weight: 950;
  letter-spacing: 1px;
}

.maintenance-page__title {
  margin: 0;
  color: var(--text);
  font-size: 32px;
  line-height: 1.25;
  font-weight: 950;
  letter-spacing: 1px;
}

.maintenance-page__desc {
  max-width: 430px;
  margin: 12px auto 0;

  color: var(--text-soft);
  font-size: 15px;
  line-height: 1.8;
  font-weight: 800;
}

.maintenance-page__notice {
  width: 100%;
  margin-top: 24px;
  padding: 18px;

  border-radius: 22px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid var(--line);
  box-shadow: 0 14px 32px rgba(63, 36, 18, 0.055);

  text-align: left;
}

.maintenance-page__noticeTitle {
  margin: 0 0 10px;
  color: var(--primary);
  font-size: 16px;
  font-weight: 950;
  line-height: 1.5;
}

.maintenance-page__noticeContent {
  display: grid;
  gap: 6px;

  p {
    margin: 0;
    color: var(--text);
    font-size: 14px;
    line-height: 1.7;
    font-weight: 800;
  }
}

.maintenance-page__time {
  display: flex;
  align-items: center;
  gap: 9px;

  margin: 14px 0 0;
  padding-top: 14px;
  border-top: 1px solid rgba(180, 51, 37, 0.14);

  color: #7f2015;
  font-size: 13px;
  font-weight: 900;
  line-height: 1.6;

  svg {
    flex: 0 0 auto;
  }
}

.maintenance-page__button {
  width: 100%;
  min-height: 56px;
  margin-top: 24px;
  padding: 0 24px;
  border: 1px solid var(--primary);
  border-radius: 999px;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;

  background: linear-gradient(135deg, var(--primary) 0%, #d66b42 100%);
  color: #fff;

  font-size: 18px;
  font-weight: 950;
  letter-spacing: 1.4px;

  cursor: pointer;
  box-shadow: 0 16px 30px rgba(180, 51, 37, 0.2);

  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    opacity 0.16s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 20px 38px rgba(180, 51, 37, 0.28);
  }

  &:active {
    transform: translateY(0);
  }
}

@media (max-width: 640px) {
  .maintenance-page {
    padding: 18px;
  }

  .maintenance-page__card {
    padding: 34px 22px 28px;
    border-radius: 30px;
  }

  .maintenance-page__logo {
    width: min(190px, 76%);
  }

  .maintenance-page__iconWrap {
    width: 76px;
    height: 76px;
  }

  .maintenance-page__icon {
    font-size: 24px;
  }

  .maintenance-page__title {
    font-size: 26px;
  }

  .maintenance-page__desc {
    font-size: 14px;
  }

  .maintenance-page__notice {
    padding: 16px;
    border-radius: 20px;
  }

  .maintenance-page__time {
    align-items: flex-start;
    font-size: 12px;
  }

  .maintenance-page__button {
    min-height: 54px;
    font-size: 17px;
  }
}

@media (max-width: 380px) {
  .maintenance-page {
    padding: 14px;
  }

  .maintenance-page__card {
    padding: 32px 18px 26px;
  }

  .maintenance-page__title {
    font-size: 24px;
  }
}
</style>
