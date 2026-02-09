<!-- src/views/News.vue -->
<template>
  <div class="news">
    <!-- Hero -->
    <section class="news__hero">
      <div class="news__heroInner">
        <div class="news__heroLeft">
          <p class="news__badge">NEWS</p>
          <h1 class="news__title">STARDO 最新消息</h1>
          <p class="news__subtitle">
            這裡會整理 STARDO
            的平台公告、活動更新與重要通知。內容以本頁最新公告為準。
          </p>
        </div>

        <aside class="news__heroRight">
          <div class="news__panel">
            <div class="news__panelHeader">
              <p class="news__panelTitle">快速篩選</p>
              <p class="news__panelDesc">依類型快速查看。</p>
            </div>

            <div class="news__filters">
              <button
                class="news__chip"
                :class="{ 'is-active': activeTab === 'all' }"
                @click="activeTab = 'all'"
              >
                <span class="news__chipIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'layer-group']" />
                </span>
                全部
              </button>

              <button
                class="news__chip"
                :class="{ 'is-active': activeTab === 'notice' }"
                @click="activeTab = 'notice'"
              >
                <span class="news__chipIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'bullhorn']" />
                </span>
                公告
              </button>

              <button
                class="news__chip"
                :class="{ 'is-active': activeTab === 'event' }"
                @click="activeTab = 'event'"
              >
                <span class="news__chipIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'bolt']" />
                </span>
                活動
              </button>

              <button
                class="news__chip"
                :class="{ 'is-active': activeTab === 'system' }"
                @click="activeTab = 'system'"
              >
                <span class="news__chipIcon" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'gear']" />
                </span>
                系統
              </button>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <!-- Content -->
    <section class="news__section" id="list">
      <div class="news__container">
        <header class="news__header">
          <h2 class="news__h2">公告列表</h2>
        </header>

        <!-- Summary -->
        <div class="news__summary">
          <div class="news__summaryItem">
            <p class="news__summaryNum">{{ totalCount }}</p>
            <p class="news__summaryLabel">全部</p>
          </div>
          <div class="news__summaryItem">
            <p class="news__summaryNum">{{ noticeCount }}</p>
            <p class="news__summaryLabel">公告</p>
          </div>
          <div class="news__summaryItem">
            <p class="news__summaryNum">{{ eventCount }}</p>
            <p class="news__summaryLabel">活動</p>
          </div>
          <div class="news__summaryItem">
            <p class="news__summaryNum">{{ systemCount }}</p>
            <p class="news__summaryLabel">系統</p>
          </div>
        </div>

        <!-- List -->
        <div v-if="filteredNews.length" class="news__grid">
          <article v-for="n in filteredNews" :key="n.id" class="news__card">
            <!-- Cover -->
            <div v-if="n.imageUrl" class="news__cover" @click="goDetail(n.id)">
              <img class="news__coverImg" :src="n.imageUrl" :alt="n.title" />
            </div>

            <div class="news__cardTop">
              <span class="news__tag" :class="tagClass(n.type)">
                <span class="news__tagIcon" aria-hidden="true">
                  <font-awesome-icon :icon="tagIcon(n.type)" />
                </span>
                {{ typeText(n.type) }}
              </span>

              <h3 class="news__cardTitle" @click="goDetail(n.id)">
                {{ n.title }}
              </h3>
              <p class="news__cardDesc">{{ n.summary }}</p>
            </div>

            <div class="news__meta">
              <div class="news__metaRow">
                <span class="news__metaKey">
                  <font-awesome-icon :icon="['fas', 'calendar-day']" />
                  發佈日期
                </span>
                <span class="news__metaVal">{{
                  formatDate(n.publishedAt)
                }}</span>
              </div>

              <div class="news__metaRow" v-if="n.important">
                <span class="news__metaKey">
                  <font-awesome-icon :icon="['fas', 'triangle-exclamation']" />
                  提醒
                </span>
                <span class="news__metaVal">此公告為重要通知</span>
              </div>
            </div>

            <div class="news__cardActions">
              <button
                class="news__btn2 news__btn2--primary"
                @click="goDetail(n.id)"
              >
                查看詳情
              </button>
            </div>
          </article>
        </div>

        <!-- Empty -->
        <div v-else class="news__empty">
          <div class="news__emptyIcon" aria-hidden="true">
            <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
          </div>
          <p class="news__emptyTitle">目前沒有符合條件的公告</p>
          <p class="news__emptyDesc">你可以切換篩選，或稍後再回來看看。</p>
          <div class="news__emptyActions">
            <button
              class="news__btn news__btn--primary"
              @click="activeTab = 'all'"
            >
              看全部
            </button>
            <button class="news__btn news__btn--ghost" @click="goHome">
              回首頁
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { getPublishedNews } from '@/services/newsService';
import { executeApi } from '@/utils/executeApiUtils';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

type NewsType = 'NOTICE' | 'EVENT' | 'SYSTEM';

const router = useRouter();
const year = computed(() => new Date().getFullYear());

/** ===== UI ===== */
const activeTab = ref<'all' | 'notice' | 'event' | 'system'>('all');
const newsList = ref<any[]>([]);

/** ===== computed ===== */
const filteredNews = computed(() => {
  if (activeTab.value === 'all') return newsList.value;
  const map = { notice: 'NOTICE', event: 'EVENT', system: 'SYSTEM' } as const;
  return newsList.value.filter((n) => n.type === map[activeTab.value]);
});

const totalCount = computed(() => newsList.value.length);
const noticeCount = computed(
  () => newsList.value.filter((n) => n.type === 'NOTICE').length,
);
const eventCount = computed(
  () => newsList.value.filter((n) => n.type === 'EVENT').length,
);
const systemCount = computed(
  () => newsList.value.filter((n) => n.type === 'SYSTEM').length,
);

/** ===== navigation ===== */
const goHome = () => router.push({ name: 'Home' });
const goShop = () => router.push({ name: 'Mall' });

const goDetail = (id: string) => {
  router.push({ name: 'NewsDetail', params: { id } });
};

/** ===== scroll ===== */
const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};
const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

/** ===== UI helpers ===== */
const formatDate = (iso?: string | null) => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}/${m}/${day}`;
};

const typeText = (t: NewsType) =>
  t === 'NOTICE' ? '公告' : t === 'EVENT' ? '活動' : '系統';

const tagIcon = (t: NewsType) => {
  if (t === 'NOTICE') return ['fas', 'bullhorn'] as const;
  if (t === 'EVENT') return ['fas', 'bolt'] as const;
  return ['fas', 'gear'] as const;
};

const tagClass = (t: NewsType) => {
  if (t === 'NOTICE') return 'is-notice';
  if (t === 'EVENT') return 'is-event';
  return 'is-system';
};

/** ===== content -> summary ===== */
const stripHtml = (html: string) =>
  String(html || '')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const makeSummary = (html: string, max = 80) => {
  const text = stripHtml(html);
  if (!text) return '—';
  return text.length > max ? `${text.slice(0, max)}…` : text;
};

/** ===== 推斷 type（你目前 res 沒 type，先用關鍵字推） ===== */
const inferType = (title: string, html: string): NewsType => {
  const t = `${title} ${stripHtml(html)}`.toLowerCase();
  if (/(維護|系統|伺服器|異常|修復|更新|maintenance|system)/i.test(t))
    return 'SYSTEM';
  if (/(活動|加碼|回饋|限量|上架|開抽|抽獎|event|campaign)/i.test(t))
    return 'EVENT';
  return 'NOTICE';
};

const isImportant = (title: string, html: string) =>
  /(重要|緊急|維護|異常|提醒)/i.test(`${title} ${stripHtml(html)}`);

/**  統一取日期：先 scheduledAt，再 createdAt，再 updatedAt */
const pickPublishedAt = (x: any) => {
  return x?.scheduledAt || x?.createdAt || x?.updatedAt || '';
};

/**  map api item -> UI item（畫面全部用這份） */
const mapToUi = (x: any): any => {
  const title = String(x?.title || '');
  const html = String(x?.content || '');
  return {
    id: String(x?.id || ''),
    title,
    html,
    imageUrl: x?.imageUrl ? String(x.imageUrl) : undefined,
    publishedAt: String(pickPublishedAt(x)),
    endTime: x?.endTime ?? null,
    type: inferType(title, html),
    summary: makeSummary(html, 80),
    important: isImportant(title, html),
  };
};

/**  你想要的 fetch 風格：list=data -> filter -> sort -> set */
const fetchNewsList = async () => {
  await executeApi({
    fn: () => getPublishedNews(),
    onSuccess: async (data: any) => {
      const list = data;

      const mapped = (Array.isArray(list) ? list : [])
        .filter((x) => String(x?.status || '').toUpperCase() === 'PUBLISHED')
        .map(mapToUi)
        .filter((x) => x.id && x.title);

      //  最新在前：用 publishedAt（scheduledAt/createdAt）
      mapped.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );

      newsList.value = mapped;
    },
  });
};

onMounted(() => {
  fetchNewsList();
});
</script>

<style scoped lang="scss">
.news {
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
    padding: 34px 0 28px;
  }

  &__heroInner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;

    display: grid;
    grid-template-columns: 1.12fr 0.88fr;
    gap: 24px;
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
    font-weight: 900;
    color: rgba(229, 166, 87, 0.95);
    background: rgba(229, 166, 87, 0.12);
    border: 1px solid rgba(229, 166, 87, 0.35);
    margin: 0 0 10px;
  }

  &__title {
    font-size: 34px;
    line-height: 1.15;
    margin: 0 0 10px;
    font-weight: 1000;
    letter-spacing: 0.2px;
  }

  &__subtitle {
    margin: 0 0 18px;
    font-size: 15px;
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.82);
    max-width: 560px;
  }

  &__heroActions {
    display: flex;
    gap: 12px;
    margin-bottom: 14px;
    flex-wrap: wrap;
  }

  &__btn {
    height: 52px;
    padding: 0 18px;
    border-radius: 999px;
    font-weight: 900;
    font-size: 15px;
    border: 0;
    cursor: pointer;
    letter-spacing: 1px;

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
    max-width: 560px;
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
  }

  &__panel {
    width: 100%;
    max-width: 460px;
    border-radius: 18px;
    padding: 16px;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.08),
      rgba(255, 255, 255, 0.04)
    );
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  &__panelHeader {
    margin-bottom: 10px;
  }

  &__panelTitle {
    margin: 0 0 6px;
    font-weight: 1000;
    letter-spacing: 1px;
    font-size: 16px;
  }

  &__panelDesc {
    margin: 0;
    font-size: 13px;
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.78);
  }

  &__filters {
    margin-top: 12px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }

  &__chip {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 12px;
    border-radius: 14px;
    cursor: pointer;

    background: rgba(0, 0, 0, 0.35);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.9);

    font-weight: 1000;
    letter-spacing: 0.4px;
    font-size: 14px;
    text-align: left;

    &.is-active {
      border-color: rgba(229, 166, 87, 0.55);
      box-shadow: 0 0 0 3px rgba(229, 166, 87, 0.18);
    }
  }

  &__chipIcon {
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

  &__panelFooter {
    margin-top: 12px;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  &__miniBtn {
    height: 40px;
    padding: 0 12px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(0, 0, 0, 0.25);
    color: rgba(255, 255, 255, 0.9);
    font-weight: 900;
    cursor: pointer;

    &--gold {
      background: rgba(229, 166, 87, 0.9);
      border-color: rgba(229, 166, 87, 0.9);
      color: #000;
    }
  }

  /* Content */
  &__section {
    padding: 34px 0 40px;
  }

  &__header {
    margin-bottom: 14px;
  }

  &__h2 {
    margin: 0 0 8px;
    font-size: 22px;
    font-weight: 1000;
    letter-spacing: 1px;
    color: #111;
  }

  &__desc {
    margin: 0;
    color: rgba(0, 0, 0, 0.65);
    line-height: 1.7;
  }

  &__summary {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    margin: 14px 0 18px;
  }

  &__summaryItem {
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 16px;
    padding: 12px 12px 10px;
  }

  &__summaryNum {
    margin: 0 0 2px;
    font-weight: 1000;
    font-size: 18px;
    color: rgba(178, 71, 58, 0.95);
  }

  &__summaryLabel {
    margin: 0;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.6);
    letter-spacing: 1px;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }

  &__card {
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 18px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /*  cover（配合 res.imageUrl） */
  &__cover {
    width: 100%;
    border-radius: 14px;
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.06);
    background: rgba(0, 0, 0, 0.03);
    cursor: pointer;
  }

  &__coverImg {
    width: 100%;
    height: 160px;
    object-fit: cover;
    display: block;
  }

  &__tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 26px;
    padding: 0 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 1000;
    letter-spacing: 1px;
    width: fit-content;

    &.is-notice {
      color: rgba(0, 0, 0, 0.9);
      background: rgba(229, 166, 87, 0.9);
      border: 1px solid rgba(229, 166, 87, 0.9);
    }

    &.is-event {
      color: #fff;
      background: rgba(178, 71, 58, 0.95);
      border: 1px solid rgba(178, 71, 58, 0.95);
    }

    &.is-system {
      color: rgba(0, 0, 0, 0.85);
      background: rgba(255, 255, 255, 0.75);
      border: 1px solid rgba(0, 0, 0, 0.08);
    }
  }

  &__tagIcon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
  }

  &__cardTitle {
    margin: 10px 0 6px;
    font-weight: 1000;
    letter-spacing: 0.2px;
    font-size: 16px;
    color: #111;
    cursor: pointer;
  }

  &__cardDesc {
    margin: 0;
    line-height: 1.7;
    color: rgba(0, 0, 0, 0.7);
    font-size: 14px;
  }

  &__meta {
    display: grid;
    gap: 8px;
    padding: 10px 0 0;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
  }

  &__metaRow {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 13px;
    color: rgba(0, 0, 0, 0.65);
  }

  &__metaKey {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex: 0 0 auto;
    color: rgba(0, 0, 0, 0.72);
    font-weight: 900;
  }

  &__metaVal {
    text-align: right;
    line-height: 1.5;
    color: rgba(0, 0, 0, 0.7);
  }

  &__cardActions {
    margin-top: auto;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  &__btn2 {
    height: 42px;
    padding: 0 12px;
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.12);
    background: rgba(255, 255, 255, 0.85);
    font-weight: 1000;
    cursor: pointer;

    &--primary {
      background: rgba(178, 71, 58, 0.95);
      border-color: rgba(178, 71, 58, 0.95);
      color: #fff;
    }
  }

  /* Empty */
  &__empty {
    margin-top: 16px;
    border-radius: 18px;
    padding: 22px;
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(0, 0, 0, 0.06);
    text-align: center;
  }

  &__emptyIcon {
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

  &__emptyTitle {
    margin: 0 0 6px;
    font-weight: 1000;
    letter-spacing: 0.2px;
    color: #111;
  }

  &__emptyDesc {
    margin: 0 0 12px;
    color: rgba(0, 0, 0, 0.65);
    line-height: 1.7;
  }

  &__emptyActions {
    display: flex;
    gap: 10px;
    justify-content: center;
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

  /* RWD */
  @media (max-width: 1024px) {
    &__heroInner {
      grid-template-columns: 1fr;
    }

    &__heroRight {
      justify-content: flex-start;
    }

    &__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    &__summary {
      grid-template-columns: repeat(2, minmax(0, 1fr));
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
      font-size: 28px;
    }

    &__grid {
      grid-template-columns: 1fr;
    }

    &__summary {
      grid-template-columns: 1fr;
    }
  }
}
</style>
