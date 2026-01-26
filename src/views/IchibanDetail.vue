<!-- src/views/IchibanDetail.vue -->
<template>
  <div class="ichibanDetail">
    <!-- 上方 Banner + 資訊區 -->
    <section class="ichibanDetail__hero">
      <div class="ichibanDetail__hero-bg" aria-hidden="true" />

      <div class="ichibanDetail__hero-inner">
        <!-- 麵包屑 -->
        <nav class="ichibanDetail__breadcrumb">
          <span class="clickable" @click="goHome">首頁</span>
          <span> / </span>
          <span>{{ breadcrumbCategory }}</span>
          <span> / </span>
          <span class="ichibanDetail__breadcrumb-current">
            {{ kujiTitle }}
          </span>
        </nav>

        <div class="ichibanDetail__top">
          <!-- Banner -->
          <div class="ichibanDetail__banner">
            <img :src="bannerSrc" alt="Ichiban Banner" />
          </div>

          <!-- Info -->
          <aside class="ichibanDetail__info">
            <template v-if="loading">
              <h1 class="ichibanDetail__title">載入中...</h1>
              <p class="ichibanDetail__subtitle">請稍候</p>
            </template>

            <template v-else-if="errorMsg">
              <h1 class="ichibanDetail__title">載入失敗</h1>
              <p class="ichibanDetail__subtitle">{{ errorMsg }}</p>
              <div class="ichibanDetail__actions">
                <KujiButton variant="secondary" block @click="reload">
                  重新載入
                </KujiButton>
              </div>
            </template>

            <template v-else>
              <h1 class="ichibanDetail__title">{{ kujiTitle }}</h1>
              <p class="ichibanDetail__subtitle">{{ kujiSubTitle }}</p>

              <!-- 價格區 -->
              <div class="ichibanDetail__prices">
                <div
                  v-for="p in prices"
                  :key="p.label"
                  class="ichibanDetail__priceItem"
                >
                  <div class="ichibanDetail__priceLabel">{{ p.label }}</div>
                  <div class="ichibanDetail__priceValue">
                    <span class="ichibanDetail__priceNumber">
                      <NumberFormatter :number="p.amount" locale="zh-TW" />
                    </span>
                    <span class="ichibanDetail__priceUnit">
                      / {{ p.unit }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- 補充資訊 -->
              <div class="ichibanDetail__meta">
                <div class="ichibanDetail__metaRow">
                  <span class="ichibanDetail__metaKey">店家</span>
                  <span class="ichibanDetail__metaVal">{{
                    detail?.storeName || '-'
                  }}</span>
                </div>
                <div class="ichibanDetail__metaRow">
                  <span class="ichibanDetail__metaKey">期間</span>
                  <span class="ichibanDetail__metaVal">{{ periodText }}</span>
                </div>
                <div class="ichibanDetail__metaRow">
                  <span class="ichibanDetail__metaKey">狀態</span>
                  <span class="ichibanDetail__metaVal">{{
                    detail?.statusName || detail?.status || '-'
                  }}</span>
                </div>
              </div>

              <!-- 按鈕 -->
              <div class="ichibanDetail__actions">
                <KujiButton variant="primary" block @click="handleDraw">
                  開抽！
                </KujiButton>

                <KujiButton variant="secondary" block @click="handleViewStatus">
                  <template #icon>
                    <font-awesome-icon :icon="['fas', 'square-check']" />
                  </template>
                  檢視抽況
                </KujiButton>
              </div>
            </template>
          </aside>
        </div>
      </div>
    </section>

    <!-- 主內容 -->
    <main class="ichibanDetail__main">
      <!-- 賞品一覽（目前你沒給 prize API，這段先保留 demo，之後接 API 我再幫你換） -->
      <section class="ichibanDetail__prizes">
        <header class="ichibanDetail__prizes-header">
          <h2 class="ichibanDetail__prizes-title">賞品一覽</h2>
        </header>

        <div class="ichibanDetail__prizes-grid">
          <IchibanPrizeCard
            v-for="item in prizes"
            :key="item.id"
            :img-src="item.imgSrc"
            :name="item.name"
            :grade-label="item.gradeLabel"
            :grade-type="item.gradeType"
            :count-text="item.countText"
            :size-text="item.sizeText"
          />
        </div>
      </section>

      <!-- 抽況 -->
      <section class="ichibanDetail__status" ref="statusSectionRef">
        <h2 class="ichibanDetail__status-title">檢視抽況</h2>

        <p class="ichibanDetail__status-summary">
          剩餘抽數：
          <NumberFormatter :number="remainingQuantity" locale="zh-TW" /> 抽
        </p>

        <IchibanStatusGrid
          :cards="statusCards"
          :active-cards="activeCards"
          :card-img="ichibanCardBack"
          @select="openDrawPanelFromCard"
        />
      </section>

      <IchibanNoticeSection />
    </main>

    <!-- 抽選面板 -->
    <IchibanDrawPanel
      :is-open="isDrawPanelOpen"
      :remaining="remainingQuantity"
      :active-cards="activeCards"
      @close="closeDrawPanel"
      @randomSelect="handleRandomSelect"
      @exchange="handleExchange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import KujiButton from '@/components/common/KujiButton.vue';

import IchibanPrizeCard from '@/components/ichiban/IchibanPrizeCard.vue';
import IchibanNoticeSection from '@/components/ichiban/IchibanNoticeSection.vue';
import IchibanStatusGrid from '@/components/ichiban/IchibanStatusGrid.vue';
import IchibanDrawPanel from '@/components/ichiban/IchibanDrawPanel.vue';

import demo1 from '@/assets/image/demo1.jpg';
import ichibanCardBack from '@/assets/image/ichibanCardBack.png';
import { getBrowseLotteryById } from '@/services/lotteryBrowseService';
import { getTickets } from '@/services/lotteryDrawService';

/* -----------------------------
 * Route
 * ----------------------------- */
const route = useRoute();
const router = useRouter();

const kujiId = computed(() => String(route.params.id || ''));

/* -----------------------------
 * API state
 * ----------------------------- */
const loading = ref(false);
const errorMsg = ref('');
const detail = ref(null);

const bannerSrc = computed(() => detail.value?.imageUrl || demo1);

const kujiTitle = computed(() => detail.value?.title || '未命名商品');
const kujiSubTitle = computed(() => detail.value?.description || '');

// breadcrumb 類別顯示
const breadcrumbCategory = computed(() => {
  // 你也可以改成依 category mapping 成「一番賞/扭蛋...」
  return detail.value?.categoryName || '商城';
});

const formatDate = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}/${m}/${day}`;
};

const periodText = computed(() => {
  const s = formatDate(detail.value?.startTime ?? null);
  const e = formatDate(detail.value?.endTime ?? null);
  if (s && e) return `${s} - ${e}`;
  if (e) return `至 ${e}`;
  if (s) return `自 ${s}`;
  return '-';
});

/* -----------------------------
 * Prices（每抽 + 多抽）
 * ----------------------------- */
type PriceItem = { label: string; amount: number; unit: string };

const prices = computed<PriceItem[]>(() => {
  const d = detail.value;
  if (!d) return [];

  const per = Number(d.currentPrice ?? d.pricePerDraw ?? 0) || 0;

  // 多抽 options：優先 10 連、其次 5 連
  const opts = Array.isArray(d.multiDrawOptions) ? [...d.multiDrawOptions] : [];
  const prefer = [10, 5];
  const chosen =
    prefer.find((x) => opts.includes(x)) ?? (opts.length ? opts[0] : null);

  const arr: PriceItem[] = [{ label: '每抽', amount: per, unit: '元' }];

  if (d.allowMultiDraw && chosen) {
    // ✅ 你的 res 有 discountedPrice（看起來是 10 連的折扣價）
    // 若是 10 連且有 discountedPrice 就用它；否則用 per * chosen
    const multiPrice =
      chosen === 10 && d.discountedPrice != null
        ? Number(d.discountedPrice) || per * chosen
        : per * chosen;

    arr.push({ label: `${chosen}連`, amount: multiPrice, unit: '元' });
  }

  return arr;
});

/* -----------------------------
 * 抽況
 * ----------------------------- */
const statusSectionRef = ref<HTMLElement | null>(null);

const isDrawPanelOpen = ref(false);
const activeCards = ref<number[]>([]);

// 剩餘抽數：用 remainingDraws（你 res 有），沒有就 0
const remainingQuantity = computed(() => {
  const n = Number(detail.value?.remainingDraws ?? 0);
  return Number.isNaN(n) ? 0 : n;
});

// 抽況格子：用 maxDraws 做總格數（保護上限避免一次渲染爆掉）
const statusCards = computed(() => {
  const total = Number(detail.value?.maxDraws ?? 0) || 0;
  const SAFE_MAX = 120; // UI 保護：最多渲染 120 格
  const len = Math.min(Math.max(total, 0), SAFE_MAX);
  return Array.from({ length: len }, (_, i) => i + 1);
});

const toggleCardSelection = (card: number) => {
  const idx = activeCards.value.indexOf(card);
  if (idx >= 0) activeCards.value.splice(idx, 1);
  else activeCards.value.push(card);
};

const openDrawPanelFromCard = (card: number) => {
  toggleCardSelection(card);
  isDrawPanelOpen.value = true;
};

const closeDrawPanel = () => {
  isDrawPanelOpen.value = false;
  activeCards.value = [];
};

/* -----------------------------
 * demo 賞品（待接 prize API）
 * ----------------------------- */
type PrizeItem = {
  id: number;
  gradeLabel: string;
  gradeType: 'primary' | 'secondary';
  countText: string;
  sizeText: string;
  name: string;
  imgSrc: string;
};

const prizes: PrizeItem[] = [
  {
    id: 1,
    gradeLabel: 'A賞',
    gradeType: 'primary',
    countText: '3/3',
    sizeText: '約25cm',
    name: '示意賞品 A',
    imgSrc: demo1,
  },
  {
    id: 2,
    gradeLabel: 'B賞',
    gradeType: 'primary',
    countText: '3/3',
    sizeText: '約25cm',
    name: '示意賞品 B',
    imgSrc: demo1,
  },
  {
    id: 3,
    gradeLabel: '最後賞',
    gradeType: 'secondary',
    countText: '1/1',
    sizeText: '約25cm',
    name: '示意最後賞',
    imgSrc: demo1,
  },
];

/* -----------------------------
 * Actions
 * ----------------------------- */
const handleDraw = () => {
  statusSectionRef.value?.scrollIntoView({ behavior: 'smooth' });
  isDrawPanelOpen.value = true;
};

const handleViewStatus = () => {
  statusSectionRef.value?.scrollIntoView({ behavior: 'smooth' });
};

// 隨機選擇
const handleRandomSelect = (count: number) => {
  const available = [...statusCards.value];
  if (!available.length) return;

  const selectCount = Math.min(count, available.length);
  const shuffled = [...available].sort(() => Math.random() - 0.5);

  activeCards.value = shuffled.slice(0, selectCount);
  isDrawPanelOpen.value = true;
};

// 兌換（你原本邏輯保留）
const handleExchange = (type: 'gold' | 'silver') => {
  if (!activeCards.value.length) {
    alert('請先選擇想要抽的格數');
    return;
  }
  console.log('[Exchange]', type, activeCards.value);
};

/* -----------------------------
 * API fetch
 * ----------------------------- */
const reload = async () => {
  if (!kujiId.value) return;

  loading.value = true;
  errorMsg.value = '';
  detail.value = null;

  try {
    const resp = await getBrowseLotteryById(kujiId.value);
    const data = (resp as any)?.data ?? resp;
    detail.value = data;

    try {
      const ticketResp = await getTickets(kujiId.value);
      const ticketData = (ticketResp as any)?.data ?? ticketResp;

      // 你要怎麼用 tickets 看你 API 回傳格式
      console.log('[tickets]', ticketData);
    } catch (err) {
      console.warn('[getTickets failed]', err);
    }
  } catch (e) {
    console.error(e);
    errorMsg.value = '無法取得商品資料，請稍後再試';
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await reload();
});

watch(
  () => kujiId.value,
  async () => {
    await reload();
  },
);

/* -----------------------------
 * Nav
 * ----------------------------- */
const goHome = () => router.push({ name: 'Home' });
</script>

<style scoped lang="scss">
.ichibanDetail {
  background: linear-gradient(180deg, #f4e1cc 0%, #f8efe3 40%, #ffffff 100%);
  min-height: 100vh;
  padding-bottom: 120px;

  &__hero {
    position: relative;
    padding-top: 24px;
    padding-bottom: 32px;
  }

  &__hero-bg {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      #f4e1cc 0%,
      #f8efe3 50%,
      rgba(255, 255, 255, 0) 100%
    );
    pointer-events: none;
  }

  &__hero-inner {
    position: relative;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }

  &__breadcrumb {
    font-size: 13px;
    color: #7b6a5a;
    margin-bottom: 8px;

    &-current {
      color: #3f2412;
      font-weight: 600;
    }
  }

  &__top {
    display: flex;
    gap: 24px;
    align-items: stretch;
  }

  &__banner {
    flex: 3;
    background: #000;
    border-radius: 12px;
    overflow: hidden;

    img {
      display: block;
      width: 100%;
      height: auto;
      object-fit: cover;
    }
  }

  &__info {
    flex: 2;
    background: #fbe8d6;
    border-radius: 12px;
    padding: 20px 24px 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__title {
    font-size: 20px;
    font-weight: 900;
    color: #3f2412;
    line-height: 1.4;
  }

  &__subtitle {
    font-size: 14px;
    color: #7b6a5a;
    line-height: 1.5;
  }

  &__prices {
    display: flex;
    gap: 18px;
    margin-top: 4px;
  }

  &__priceItem {
    min-width: 90px;
    text-align: right;
  }

  &__priceLabel {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 2px 10px;
    border-radius: 999px;
    background: #ffffff;
    color: #e5a657;
    font-size: 12px;
    font-weight: 700;
  }

  &__priceValue {
    margin-top: 4px;
    color: #3f2412;
    font-weight: 900;
  }

  &__priceNumber {
    font-size: 22px;
  }

  &__priceUnit {
    font-size: 11px;
    margin-left: 2px;
  }

  &__meta {
    display: grid;
    gap: 6px;
    padding-top: 6px;
  }

  &__metaRow {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 13px;
    color: #6b5a4d;
  }

  &__metaKey {
    opacity: 0.85;
  }

  &__metaVal {
    color: #3f2412;
    font-weight: 700;
    text-align: right;
  }

  &__actions {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }

  &__prizes {
    margin-top: 24px;
    background: #a23b2f;
    border-radius: 18px 18px 0 0;
    padding: 24px 24px 32px;
    color: #ffffff;
  }

  &__prizes-header {
    text-align: center;
    margin-bottom: 24px;
  }

  &__prizes-title {
    font-size: 20px;
    font-weight: 900;
    letter-spacing: 2px;
  }

  &__prizes-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 24px 20px;
  }

  &__status {
    background: #000000;
    color: #ffffff;
    padding: 32px 24px 40px;
    border-radius: 0 0 18px 18px;
    margin-top: 0;
  }

  &__status-title {
    text-align: center;
    font-size: 20px;
    font-weight: 900;
    letter-spacing: 2px;
    margin: 0 0 12px;
  }

  &__status-summary {
    text-align: center;
    font-size: 14px;
    margin-bottom: 16px;
    color: #f3cf7a;
  }

  @media (max-width: 1024px) {
    &__top {
      flex-direction: column;
    }
    &__prizes-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    &__prizes-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
}
</style>
