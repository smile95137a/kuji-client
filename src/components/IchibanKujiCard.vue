<!-- src/components/IchibanKujiCard.vue -->
<template>
  <article
    class="kuji-card"
    role="button"
    tabindex="0"
    @click="$emit('click')"
    @keyup.enter="$emit('click')"
  >
    <!-- Banner -->
    <section class="kuji-card__banner">
      <div class="kuji-card__banner-frame">
        <img
          class="kuji-card__banner-img"
          :src="resolvedBannerSrc"
          :alt="resolvedAlt"
          loading="lazy"
        />
      </div>

      <!-- Bottom overlay -->
      <div class="kuji-card__overlay">
        <!-- Status box -->
        <div class="kuji-card__status">
          <div class="kuji-card__status-badge">
            <img
              class="kuji-card__status-badgeImg"
              :src="IchibanKujiCardOpen"
              alt=""
              draggable="false"
            />

            <!-- ✅ 狀態字：已上架 / 草稿 / 已下架 -->
            <span class="kuji-card__status-text">
              {{ resolvedStatusText }}
            </span>
          </div>

          <div class="kuji-card__status-sub">
            <p class="kuji-card__status-subLabel">剩餘</p>

            <div class="kuji-card__status-subRow">
              <span class="kuji-card__status-subValue">
                {{ resolvedRemaining }}
              </span>
              <span class="kuji-card__status-subUnit">抽</span>
            </div>
          </div>
        </div>

        <!-- Prices -->
        <div class="kuji-card__prices">
          <div
            v-for="(p, idx) in resolvedPrices"
            :key="idx"
            class="kuji-card__price"
          >
            <div class="kuji-card__price-pill">{{ p.label }}</div>
            <div class="kuji-card__price-value">
              <span class="kuji-card__price-number">{{
                formatNumber(p.amount)
              }}</span>
              <span class="kuji-card__price-unit">/{{ p.unit }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="kuji-card__body">
      <!-- Title -->
      <h3 class="kuji-card__title">
        {{ resolvedTitle }}
      </h3>

      <!-- Meta -->
      <div class="kuji-card__meta">
        <div class="kuji-card__meta-item">
          <font-awesome-icon
            class="kuji-card__meta-icon"
            :icon="['fas', 'calendar-days']"
          />
          <span class="kuji-card__meta-text">{{ resolvedTimeText }}</span>
        </div>

        <div class="kuji-card__meta-item">
          <font-awesome-icon
            class="kuji-card__meta-icon"
            :icon="['fas', 'store']"
          />
          <span class="kuji-card__meta-text">{{ resolvedTagText }}</span>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import IchibanKujiCardOpen from '@/assets/image/IchibanKujiCardOpen.png';
import demo1 from '@/assets/image/demo1.jpg';

type PriceItem = {
  label: string; // 單抽 / 十連 / 金幣 / 銀幣...
  amount: number;
  unit: string; // 抽
};

type LotteryItem = {
  id: string;
  storeId?: string;
  storeName?: string;

  title?: string;
  
  // 圖片（支援多種格式）
  bannerSrc?: string;
  imageUrl?: string;
  mainImageUrl?: string;

  category?: string;
  categoryName?: string;
  subCategory?: string;

  pricePerDraw?: number;
  currentPrice?: number;

  scheduledAt?: string; // 2026-01-20T10:24:00
  endTime?: string;
  createdAt?: string;

  totalDraws?: number;
  maxDraws?: number;
  remainingDraws?: number;
  remaining?: number;
  remainingUnit?: string;

  totalPrizes?: number;
  remainingPrizes?: number;
  
  // 舊格式支援
  prices?: PriceItem[];
  timeText?: string;
  tagText?: string;

  status?: string;
  statusName?: string;
};

const props = defineProps<{
  item: LotteryItem;
}>();

defineEmits<{ (e: 'click'): void }>();

/* ------------------------------
 * computed display
 * ------------------------------ */
const resolvedTitle = computed(() => props.item?.title || '未命名商品');

const resolvedAlt = computed(() => props.item?.title || 'kuji');

const resolvedBannerSrc = computed(() => {
  // 支援新舊格式：mainImageUrl > bannerSrc > imageUrl
  const url = String(
    props.item?.mainImageUrl ?? props.item?.bannerSrc ?? props.item?.imageUrl ?? ''
  ).trim();
  return url ? url : demo1;
});

const resolvedRemaining = computed(() => {
  const n =
    props.item?.remaining ??
    props.item?.remainingDraws ??
    props.item?.remainingPrizes ??
    props.item?.maxDraws ??
    0;
  return Number(n) || 0;
});

const resolvedMaxDraws = computed(() => {
  return Number(props.item?.maxDraws ?? 0) || 0;
});

const resolvedStatusText = computed(() => {
  return props.item?.statusName || '開抽中';
});

const resolvedTagText = computed(() => {
  // 優先使用 tagText（舊格式），再來是店家名
  if (props.item?.tagText) return props.item.tagText;
  return props.item?.storeName || props.item?.categoryName || 'KUJI';
});

const formatDate = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}/${m}/${day}`;
};

const resolvedTimeText = computed(() => {
  // 優先使用 timeText（舊格式）
  if (props.item?.timeText) return props.item.timeText;
  
  const start = formatDate(props.item?.scheduledAt ?? props.item?.createdAt);
  const end = formatDate(props.item?.endTime);

  if (start && end) return `${start} - ${end}`;
  if (end) return `至 ${end}`;
  if (start) return `自 ${start}`;
  return '-';
});

const resolvedPrices = computed<PriceItem[]>(() => {
  // 優先使用 prices（舊格式）
  if (props.item?.prices && props.item.prices.length > 0) {
    return props.item.prices;
  }

  const base =
    Number(props.item?.currentPrice ?? props.item?.pricePerDraw ?? 0) || 0;

  // 顯示「單抽 / 十連」
  return [
    { label: '單抽', amount: base || 0, unit: '抽' },
    { label: '十連', amount: (base || 0) * 10, unit: '抽' },
  ];
});

const formatNumber = (n: number) => new Intl.NumberFormat('en-US').format(n);
</script>

<style scoped lang="scss">
.kuji-card {
  width: 100%;
  max-width: 820px;
  border-radius: 18px;
  cursor: pointer;
  user-select: none;

  &:focus-visible {
    outline: 3px solid rgba(0, 0, 0, 0.18);
    outline-offset: 3px;
    border-radius: 18px;
  }

  &__banner {
    position: relative;
  }

  &__banner-frame {
    overflow: hidden;
    background: #111;
  }

  &__banner-img {
    width: 100%;
    height: auto;
    display: block;
    aspect-ratio: 16 / 9;
    object-fit: cover; /* ✅ 建議 cover：圖片會更像商城卡片 */
  }

  &__overlay {
    display: flex;
    gap: 16px;
    height: 72px;
    background: #dfbc94;
    position: relative;
    padding: 16px;
    border-radius: 0 0 12px 12px;
  }

  /* 左下紅色狀態框 */
  &__status {
    width: 94px;
    height: 80px;
    position: absolute;
    bottom: 0;
    left: -12px;
    background: #a54335;
    border-radius: 18px;
    padding: 4px;
    color: #fff;

    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }

  &__status-badge {
    position: relative;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
  }

  &__status-badgeImg {
    width: 80px;
    height: auto;
    display: block;
  }

  /* ✅ 狀態字（壓在 badge 上） */
  &__status-text {
    position: absolute;
    left: 50%;
    top: 18px;
    transform: translateX(-50%);
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 1px;
    color: #111;
    background: rgba(255, 255, 255, 0.9);
    padding: 2px 8px;
    border-radius: 999px;
    white-space: nowrap;
  }

  /* 下方剩餘區 */
  &__status-sub {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
    line-height: 1;
    align-items: center;
    margin-top: -4px;
  }

  &__status-subLabel {
    margin: 0;
    opacity: 0.95;
    letter-spacing: 1px;
  }

  &__status-subRow {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  &__status-subValue {
    font-weight: 900;
    font-size: 18px;
    line-height: 1;
  }

  &__status-subUnit {
    font-size: 12px;
    opacity: 0.95;
  }

  /* 右側價格區 */
  &__prices {
    flex: 1;
    display: flex;
    gap: 18px;
    justify-content: flex-end;
    align-items: center;
  }

  &__price {
    min-width: 68px;
    text-align: center;
    color: #fff;
    display: flex;
    align-items: end;
    flex-direction: column;
    gap: 4px;
  }

  &__price-pill {
    display: flex;
    width: 66px;
    height: 16px;
    align-items: center;
    justify-content: center;
    color: #e5a657;
    background: #ffffff;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 900;
  }

  &__price-value {
    font-weight: 900;
    line-height: 1;
  }

  &__price-number {
    font-size: 20px;
  }

  &__price-unit {
    font-size: 10px;
  }

  &__body {
    margin-top: -12px;
    background-color: rgba(255, 255, 255, 0.5);
    border-radius: 0 0 12px 12px;
    overflow: hidden;
  }

  &__title {
    padding: 24px 12px 6px 12px;
    font-size: 18px;
    font-weight: 900;
    color: #111;
    line-height: 1.35;
  }

  &__meta {
    padding: 10px 18px 18px 18px;
    display: flex;
    gap: 28px;
    align-items: center;
    color: rgba(0, 0, 0, 0.58);
    font-weight: 700;
  }

  &__meta-item {
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }

  &__meta-icon {
    width: 22px;
    height: 22px;
  }

  &__meta-text {
    font-size: 14px;
  }
}
</style>
