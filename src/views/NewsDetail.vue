<!-- src/views/NewsDetail.vue -->
<template>
  <div class="newsDetail">
    <!-- Hero -->
    <section class="newsDetail__hero">
      <div class="newsDetail__heroInner">
        <button class="newsDetail__backBtn" type="button" @click="goBack">
          <font-awesome-icon :icon="['fas', 'arrow-left']" />
          回公告列表
        </button>

        <div class="newsDetail__heroGrid">
          <div class="newsDetail__heroLeft">
            <p class="newsDetail__badge">{{ typeLabel }}</p>

            <h1 class="newsDetail__title">
              {{ detail?.title || '公告詳情' }}
            </h1>

            <p class="newsDetail__meta">
              <span class="newsDetail__metaItem">
                <font-awesome-icon :icon="['fas', 'calendar-day']" />
                發佈：{{ formatDate(publishedAt) }}
              </span>

              <span
                v-if="hasPeriod"
                :class="[
                  'newsDetail__metaItem',
                  isEnded ? 'newsDetail__metaItem--ended' : '',
                ]"
              >
                <font-awesome-icon :icon="['fas', 'clock']" />
                活動：{{ periodText }}
              </span>

              <span
                v-if="statusName"
                class="newsDetail__metaItem newsDetail__metaItem--status"
              >
                <font-awesome-icon :icon="['fas', 'tag']" />
                {{ statusName }}
              </span>
            </p>

            <div
              class="newsDetail__hint"
              v-if="detail?.scheduledAt || detail?.endTime"
            >
              <span class="newsDetail__hintIcon" aria-hidden="true">
                <font-awesome-icon :icon="['fas', 'circle-info']" />
              </span>
              <span class="newsDetail__hintText">
                時間以「發佈 ~ 結束」為準，過期公告仍會保留為歷史記錄。
              </span>
            </div>
          </div>

          <aside class="newsDetail__heroRight">
            <div class="newsDetail__cover" v-if="detail?.imageUrl">
              <img
                class="newsDetail__coverImg"
                :src="detail.imageUrl"
                :alt="detail.title"
              />
            </div>

            <div class="newsDetail__skeletonCover" v-else>
              <div class="newsDetail__skeletonBlock"></div>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <!-- Content -->
    <section class="newsDetail__section">
      <div class="newsDetail__container">
        <!-- Detail -->
        <div class="newsDetail__card">
          <div
            class="newsDetail__content ck-content"
            v-html="sanitizedHtml"
          ></div>

          <div class="newsDetail__divider"></div>

          <div class="newsDetail__bottomActions">
            <button
              class="newsDetail__btn newsDetail__btn--ghost"
              @click="goBack"
            >
              回公告列表
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { executeApi } from '@/utils/executeApiUtils';
import { getNewsDetail } from '@/services/newsService';

const route = useRoute();
const router = useRouter();

const id = computed(() => String(route.params.id || ''));

const detail = ref<any>({});

/** derived */
const statusName = computed(() => detail.value?.statusName || '');
const publishedAt = computed(() => {
  const d = detail.value;
  // prefer scheduledAt, fallback to createdAt / updatedAt
  return d?.scheduledAt || d?.createdAt || d?.updatedAt || '';
});

const hasPeriod = computed(() =>
  Boolean(detail.value?.scheduledAt || detail.value?.endTime),
);
const isEnded = computed(() => {
  const e = detail.value?.endTime;
  if (!e) return false;
  return Date.now() > new Date(e).getTime();
});
const periodText = computed(() => {
  const s = detail.value?.scheduledAt;
  const e = detail.value?.endTime;
  if (!s && !e) return '-';
  const fmt = (iso?: string | null) => {
    if (!iso) return '-';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  };
  if (s && e) return `${fmt(s)} ～ ${fmt(e)}`;
  if (s) return `${fmt(s)} 起`;
  return `～ ${fmt(e)}`;
});

/** inference for badge label (簡單猜 type) */
const inferType = (title = '', html = '') => {
  const t = `${title} ${html}`.toLowerCase();
  if (/(維護|系統|伺服器|異常|修復|更新|maintenance|system)/i.test(t))
    return '系統';
  if (/(活動|加碼|回饋|限量|上架|開抽|抽獎|event|campaign|活動期間)/i.test(t))
    return '活動';
  return '公告';
};
const typeLabel = computed(() =>
  inferType(detail.value?.title || '', detail.value?.content || ''),
);

/** ===== navigation ===== */
const goBack = () => router.push({ name: 'News' });

/** ===== helpers ===== */
const formatDate = (iso?: string | null) => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}/${m}/${day}`;
};

const sanitizeHtml = (html: string) => {
  let raw = String(html || '');
  // remove scripts
  raw = raw.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
  // remove on* attributes (onload, onclick...)
  raw = raw.replace(/\son\w+=(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');
  // force links open safely
  raw = raw.replace(
    /<a\s+([^>]*?)href=(['"]?)(https?:\/\/[^'"\s>]+)\2([^>]*)>/gi,
    (m, pre, q, href, post) => {
      // keep existing attributes (pre + post), but ensure target/rel
      const attrs = `${pre} href="${href}" ${post}`;
      // remove duplicate target/rel first
      const cleaned = attrs
        .replace(/\starget=(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')
        .replace(/\srel=(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');
      return `<a ${cleaned} target="_blank" rel="noopener noreferrer">`;
    },
  );
  return raw;
};

const sanitizedHtml = computed(() => sanitizeHtml(detail.value?.content || ''));

/** ===== fetch ===== */
const fetchDetail = async () => {
  if (!id.value) return;
  await executeApi({
    fn: async () => getNewsDetail(id.value),
    onSuccess: async (data: any) => {
      detail.value = data;
    },
  });
};

onMounted(() => {
  fetchDetail();
});
</script>

<style scoped lang="scss">
.newsDetail {
  background: linear-gradient(180deg, #f4e1cc 0%, #f8efe3 40%, #ffffff 100%);
  min-height: 100vh;
  position: relative;
  z-index: 9;

  &__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }

  /* Hero */
  &__hero {
    background: #000;
    color: #fff;
    padding: 26px 0 22px;
  }

  &__heroInner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }

  &__backBtn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    height: 44px;
    padding: 0 14px;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.06);
    color: #fff;
    cursor: pointer;
    font-weight: 900;
    letter-spacing: 0.3px;
    margin-bottom: 14px;
  }

  &__heroGrid {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 18px;
    align-items: stretch;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 26px;
    padding: 0 10px;
    border-radius: 999px;
    font-size: 12px;
    letter-spacing: 2px;
    font-weight: 1000;
    color: rgba(229, 166, 87, 0.95);
    background: rgba(229, 166, 87, 0.12);
    border: 1px solid rgba(229, 166, 87, 0.35);
    margin: 0 0 10px;
  }

  &__title {
    margin: 0 0 10px;
    font-size: 30px;
    line-height: 1.2;
    font-weight: 1000;
    letter-spacing: 0.2px;
  }

  &__meta {
    margin: 0 0 14px;
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    color: rgba(255, 255, 255, 0.82);
    font-size: 13px;
    line-height: 1.7;
  }

  &__metaItem {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);

    &--ended {
      background: rgba(255, 255, 255, 0.04);
      color: rgba(180, 50, 50, 0.95);
      border-color: rgba(180, 50, 50, 0.2);
    }

    &--status {
      color: rgba(229, 166, 87, 0.95);
      border-color: rgba(229, 166, 87, 0.25);
      background: rgba(229, 166, 87, 0.08);
    }
  }

  &__heroActions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }

  &__btn {
    height: 48px;
    padding: 0 16px;
    border-radius: 999px;
    font-weight: 1000;
    font-size: 14px;
    border: 0;
    cursor: pointer;
    letter-spacing: 0.6px;

    &--primary {
      background: #b2473a;
      color: #fff;
    }

    &--ghost {
      background: transparent;
      color: rgba(229, 166, 87, 0.95);
      border: 1px solid rgba(229, 166, 87, 0.55);
    }
  }

  &__hint {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    color: rgba(255, 255, 255, 0.78);
    font-size: 13px;
    line-height: 1.7;
    max-width: 680px;
  }

  &__hintIcon {
    width: 34px;
    height: 34px;
    border-radius: 12px;
    display: grid;
    place-items: center;

    background: rgba(229, 166, 87, 0.12);
    border: 1px solid rgba(229, 166, 87, 0.22);
    color: rgba(229, 166, 87, 0.95);
    flex: 0 0 auto;
  }

  &__heroRight {
    display: flex;
    justify-content: flex-end;
    flex-direction: column;
    gap: 12px;
  }

  &__cover {
    width: 100%;
    max-width: 520px;
    border-radius: 18px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.05);
  }

  &__coverImg {
    width: 100%;
    height: 280px;
    object-fit: cover;
    display: block;
  }

  &__skeletonCover {
    width: 100%;
    max-width: 520px;
    height: 280px;
    border-radius: 18px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.05);
  }

  &__skeletonBlock {
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.05),
      rgba(255, 255, 255, 0.1),
      rgba(255, 255, 255, 0.05)
    );
    background-size: 200% 100%;
    animation: shimmer 1.1s linear infinite;
  }

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  /* quick actions */
  .newsDetail__quickActions {
    display: flex;
    gap: 8px;
    margin-top: 6px;
    flex-wrap: wrap;
  }

  &__miniBtn {
    height: 40px;
    padding: 0 12px;
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.12);
    background: rgba(255, 255, 255, 0.85);
    font-weight: 1000;
    cursor: pointer;

    &--gold {
      background: rgba(229, 166, 87, 0.9);
      border-color: rgba(229, 166, 87, 0.9);
      color: #000;
    }
  }

  /* Content */
  &__section {
    padding: 28px 0 40px;
  }

  &__loading,
  &__error {
    border-radius: 18px;
    padding: 22px;
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(0, 0, 0, 0.06);
    text-align: center;
  }

  &__loadingSpinner {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    border: 4px solid rgba(0, 0, 0, 0.08);
    border-top-color: rgba(178, 71, 58, 0.95);
    margin: 0 auto 10px;
    animation: spin 0.9s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  &__loadingText {
    margin: 0;
    font-weight: 1000;
    color: rgba(0, 0, 0, 0.65);
  }

  &__errorIcon {
    width: 54px;
    height: 54px;
    border-radius: 16px;
    display: grid;
    place-items: center;
    margin: 0 auto 10px;

    background: rgba(178, 71, 58, 0.08);
    border: 1px solid rgba(178, 71, 58, 0.14);
    color: rgba(178, 71, 58, 0.95);
    font-size: 18px;
  }

  &__errorTitle {
    margin: 0 0 6px;
    font-weight: 1000;
    color: #111;
  }

  &__errorDesc {
    margin: 0 0 12px;
    color: rgba(0, 0, 0, 0.65);
    line-height: 1.7;
  }

  &__errorActions {
    display: flex;
    gap: 10px;
    justify-content: center;
    flex-wrap: wrap;
  }

  &__card {
    background: rgba(255, 255, 255, 0.98);
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 18px;
    overflow: hidden;
  }

  &__cardHead {
    padding: 14px 14px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  &__cardHeadTitle {
    margin: 0;
    font-weight: 1000;
    letter-spacing: 0.3px;
    color: #111;
  }

  &__cardHeadActions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  /*  CKEditor content 容器 */
  &__content {
    padding: 16px 16px 6px;
    color: rgba(0, 0, 0, 0.85);
    line-height: 1.85;

    :deep(img) {
      max-width: 100%;
      height: auto;
      border-radius: 14px;
      display: block;
      margin: 10px 0;
    }

    :deep(figure) {
      margin: 10px 0;
    }

    :deep(h2) {
      margin: 14px 0 8px;
      font-size: 20px;
      line-height: 1.4;
      font-weight: 1000;
      color: #111;
    }

    :deep(h3) {
      margin: 12px 0 8px;
      font-size: 16px;
      line-height: 1.5;
      font-weight: 1000;
      color: #111;
    }

    :deep(p) {
      margin: 0 0 12px;
    }

    :deep(ul),
    :deep(ol) {
      margin: 0 0 12px;
      padding-left: 18px;
    }

    :deep(blockquote) {
      margin: 12px 0;
      padding: 12px 12px;
      border-left: 4px solid rgba(178, 71, 58, 0.35);
      background: rgba(178, 71, 58, 0.06);
      border-radius: 12px;
    }

    :deep(table) {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      overflow: hidden;
      border-radius: 12px;
      border: 1px solid rgba(0, 0, 0, 0.08);
    }

    :deep(th),
    :deep(td) {
      padding: 10px 10px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      text-align: left;
      font-size: 14px;
    }

    :deep(th) {
      background: rgba(0, 0, 0, 0.04);
      font-weight: 1000;
      color: rgba(0, 0, 0, 0.8);
    }

    :deep(a) {
      color: #b2473a;
      text-decoration: underline;
    }
  }

  &__divider {
    height: 1px;
    background: rgba(0, 0, 0, 0.06);
    margin: 6px 0 0;
  }

  &__bottomActions {
    padding: 14px 14px 16px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    flex-wrap: wrap;
  }

  /* CTA */
  &__cta {
    margin-top: 18px;
    border-radius: 18px;
    padding: 18px;
    background: linear-gradient(135deg, #b2473a, #7a1a12);
    color: #fff;

    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: center;
    flex-wrap: wrap;
  }

  &__ctaTitle {
    margin: 0 0 4px;
    font-weight: 1000;
    letter-spacing: 0.3px;
    font-size: 18px;
  }

  &__ctaDesc {
    margin: 0;
    color: rgba(255, 255, 255, 0.85);
    line-height: 1.7;
    font-size: 14px;
  }

  &__ctaRight {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  /* Footer */
  &__footer {
    padding: 18px 0 24px;
  }

  &__footerInner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  &__footerText {
    margin: 0;
    color: rgba(0, 0, 0, 0.6);
    font-size: 13px;
  }

  &__footerTop {
    height: 40px;
    padding: 0 12px;
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.12);
    background: rgba(255, 255, 255, 0.7);
    font-weight: 900;
    cursor: pointer;
  }

  /* empty */
  &__empty {
    text-align: center;
    padding: 40px 18px;
  }

  &__emptyTitle {
    font-weight: 900;
    margin-bottom: 6px;
  }

  &__emptyDesc {
    color: rgba(0, 0, 0, 0.6);
    margin-bottom: 14px;
  }

  &__emptyActions {
    display: flex;
    gap: 8px;
    justify-content: center;
  }

  /* RWD */
  @media (max-width: 1024px) {
    &__heroGrid {
      grid-template-columns: 1fr;
    }

    &__heroRight {
      justify-content: flex-start;
    }

    &__cover,
    &__skeletonCover {
      max-width: 100%;
    }

    &__coverImg {
      height: 240px;
    }
  }

  @media (max-width: 640px) {
    &__container {
      padding: 0 16px;
    }

    &__heroInner {
      padding: 0 16px;
    }

    &__title {
      font-size: 24px;
    }

    &__coverImg {
      height: 200px;
    }
  }
}
</style>
