<!-- src/views/Maintenance.vue -->
<template>
  <div class="maintenance-page">
    <img
      class="maintenance-page__bg"
      :src="headerBg"
      alt=""
      aria-hidden="true"
      draggable="false"
    />

    <div class="maintenance-page__mask"></div>

    <main class="maintenance-page__main">
      <section class="maintenance-page__card">
        <img class="maintenance-page__logo" :src="weblogo" alt="ICHIBAN KUJI" />

        <div class="maintenance-page__icon">
          <font-awesome-icon :icon="mainIcon" />
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
          <p class="maintenance-page__notice-title">
            {{ formatAnnouncementTitle(announcement.title) }}
          </p>

          <div class="maintenance-page__notice-content">
            <p
              v-for="line in formatAnnouncementContentLines(
                announcement.content,
              )"
              :key="line"
            >
              {{ line }}
            </p>
          </div>

          <p
            v-if="
              announcement.maintenanceStartTime ||
              announcement.maintenanceEndTime
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
          <p class="maintenance-page__notice-title">服務暫時無法使用</p>

          <div class="maintenance-page__notice-content">
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import weblogo from '@/assets/image/weblogo.png';
import headerBg from '@/assets/image/header_bg.jpg';

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
    return '平台正在進行版本更新，更新完成後將提供更穩定的服務體驗。';
  }

  if (type === 'MAINTENANCE') {
    return '系統目前正在維護中，暫時無法使用服務，造成不便敬請見諒。';
  }

  return '系統目前暫時無法使用，請稍後再試。';
});

const mainIcon = computed(() => {
  const type = announcement.value?.announcementType;

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
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: #efe2d3;

  &__bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
  }

  &__mask {
    position: absolute;
    inset: 0;
    background: rgba(239, 226, 211, 0.84);
  }

  &__main {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 16px;
  }

  &__card {
    width: min(520px, 100%);
    padding: 34px 32px 30px;
    border-radius: 22px;
    background: #fff;
    text-align: center;
    box-shadow: 0 18px 48px rgba(63, 36, 18, 0.18);
    border-top: 8px solid #b43325;
  }

  &__logo {
    width: min(230px, 78%);
    height: auto;
    margin-bottom: 10px;
    filter: drop-shadow(0 10px 14px rgba(0, 0, 0, 0.18));
  }

  &__icon {
    width: 54px;
    height: 54px;
    margin: 8px auto 14px;
    border-radius: 50%;
    background: #b43325;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
  }

  &__tag {
    display: inline-flex;
    margin: 0 0 10px;
    padding: 4px 12px;
    border-radius: 999px;
    background: #e0bc94;
    color: #3f2412;
    font-size: 13px;
    font-weight: 900;
  }

  &__title {
    margin: 0;
    color: #3f2412;
    font-size: 32px;
    font-weight: 900;
    letter-spacing: 1px;
  }

  &__desc {
    margin: 12px auto 0;
    max-width: 420px;
    color: #6b4f3b;
    font-size: 15px;
    line-height: 1.8;
  }

  &__notice {
    margin-top: 22px;
    padding: 16px 18px;
    border-radius: 14px;
    background: #f8efe5;
    text-align: left;
  }

  &__notice-title {
    margin: 0 0 10px;
    color: #b43325;
    font-size: 16px;
    font-weight: 900;
    line-height: 1.5;
  }

  &__notice-content {
    display: grid;
    gap: 6px;

    p {
      margin: 0;
      color: #3f2412;
      font-size: 14px;
      line-height: 1.7;
    }
  }

  &__time {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 12px 0 0;
    padding-top: 12px;
    border-top: 1px solid rgba(180, 51, 37, 0.18);
    color: #7f1d1d;
    font-size: 13px;
    font-weight: 800;
    line-height: 1.6;
  }

  &__button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-width: 150px;
    height: 44px;
    margin-top: 24px;
    border: 0;
    border-radius: 10px;
    background: #b43325;
    color: #fff;
    font-size: 14px;
    font-weight: 900;
    cursor: pointer;
    transition:
      background 0.16s ease,
      transform 0.16s ease;

    &:hover {
      background: #9f2d21;
      transform: translateY(-1px);
    }
  }
}

@media (max-width: 640px) {
  .maintenance-page {
    &__main {
      align-items: flex-start;
      padding: 24px 12px;
    }

    &__card {
      padding: 28px 18px 24px;
      border-radius: 18px;
    }

    &__logo {
      width: min(200px, 82%);
    }

    &__title {
      font-size: 28px;
    }

    &__desc {
      font-size: 14px;
    }

    &__notice {
      padding: 14px;
    }

    &__time {
      align-items: flex-start;
      font-size: 12px;
    }

    &__button {
      width: 100%;
    }
  }
}
</style>
