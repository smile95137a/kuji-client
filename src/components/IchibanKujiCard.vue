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
          :src="resolvedImgSrc"
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
            />
          </div>

          <div class="kuji-card__status-sub">
            <p class="kuji-card__status-subLabel">剩餘</p>

            <div class="kuji-card__status-subRow">
              <span class="kuji-card__status-subValue">{{
                resolvedRemainingPrizes
              }}</span>
              <span class="kuji-card__status-subUnit"
                >/ {{ resolvedTotalPrizes }}</span
              >
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
          <span class="kuji-card__meta-text">{{ relativeCreatedAt }}</span>
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
import IchibanKujiCardOpen from '@/assets/image/IchibanKujiCardOpen.png';
import demo1 from '@/assets/image/demo1.jpg';
import { computed } from 'vue';

const props = defineProps<{
  item: any;
}>();

defineEmits<{ (e: 'click'): void }>();
/* ------------------------------
 * computed display
 * ------------------------------ */
const resolvedTitle = computed(() => props.item?.title || '未命名商品');

const resolvedImgSrc = computed(() => {
  const url = String(props.item?.imageUrl ?? '').trim();
  return url ? url : demo1;
});

const resolvedRemainingPrizes = computed(() => {
  const n = props.item?.remainingPrizes;
  return ~~n;
});

const resolvedTotalPrizes = computed(() => {
  const n = props.item?.totalPrizes;
  return ~~n;
});

const resolvedTagText = computed(() => {
  return props.item?.storeName || 'KUJI';
});

const resolvedPrices = computed<any[]>(() => {
  const base =
    Number(props.item?.currentPrice ?? props.item?.pricePerDraw ?? 0) || 0;

  return [
    { label: '單抽', amount: base || 0, unit: '抽' },
    { label: '十連', amount: (base || 0) * 10, unit: '抽' },
  ];
});

const parseDate = (input: any): Date | null => {
  if (!input) return null;

  // Date 物件
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;

  // number timestamp（秒 / 毫秒）
  if (typeof input === 'number') {
    const ms = input < 1e12 ? input * 1000 : input;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }

  // string（ISO / 'YYYY-MM-DD HH:mm:ss' 等）
  if (typeof input === 'string') {
    const s = input.trim();
    if (!s) return null;

    // 兼容 'YYYY-MM-DD HH:mm:ss' -> 'YYYY-MM-DDTHH:mm:ss'
    const normalized = s.includes('T') ? s : s.replace(' ', 'T');
    const d = new Date(normalized);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
};

const formatRelativeTimeZh = (date: Date, now = new Date()) => {
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return '剛剛';

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < hour) {
    const mins = Math.max(1, Math.floor(diffMs / minute));
    return mins <= 1 ? '1分鐘前' : `${mins}分鐘前`;
  }

  if (diffMs < day) {
    const hrs = Math.floor(diffMs / hour);
    return hrs <= 1 ? '1小時前' : `${hrs}小時前`;
  }

  const days = Math.floor(diffMs / day);

  if (days < 7) return days <= 1 ? '1天前' : `${days}天前`;

  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return weeks <= 1 ? '1週前' : `${weeks}週前`;
  }

  // >= 30 天：用「月」(以年月差計算，避免 31/28 天問題)
  const y1 = now.getFullYear();
  const m1 = now.getMonth();
  const y2 = date.getFullYear();
  const m2 = date.getMonth();

  let months = (y1 - y2) * 12 + (m1 - m2);

  // 如果「本月還沒到那一天」，月數要 -1（避免 1/30 對 12/31 算成 1 個月）
  if (now.getDate() < date.getDate()) months -= 1;

  if (months <= 0) {
    // 落在 30~59 天但月差算出 0 的 case（例如 1/31 vs 1/01）
    const approxWeeks = Math.floor(days / 7);
    return approxWeeks <= 1 ? '1週前' : `${approxWeeks}週前`;
  }

  if (months < 12) return months === 1 ? '1個月前' : `${months}個月前`;

  const years = Math.floor(months / 12);
  return years === 1 ? '1年前' : `${years}年前`;
};

const relativeCreatedAt = computed(() => {
  const d = parseDate(props.item?.createdAt);
  if (!d) return '—';
  return formatRelativeTimeZh(d);
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
    object-fit: contain;
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

  /* badge 容器 */
  &__status-badge {
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
  }

  /* badge 圖片（你 template 用 img 的話就用這個 class） */
  &__status-badgeImg {
    width: 80px; /* 視你的圖再微調 */
    height: auto;
    display: block;
  }

  /* 你如果還有用文字版 badge 才會用到 */
  &__status-badgeText {
    display: inline-block;
    font-weight: 900;
    font-size: 34px;
    color: #111;
    letter-spacing: 2px;
    transform: skewX(8deg);

    -webkit-text-stroke: 4px #111;
    text-shadow: 0 4px 0 rgba(0, 0, 0, 0.25);
    paint-order: stroke fill;
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

  /* 「剩餘」 */
  &__status-subLabel {
    margin: 0;
    opacity: 0.95;
    letter-spacing: 1px;
  }

  /* 數字 + 單位那一行（你 template 如果有包一層 div，建議加這個 class） */
  &__status-subRow {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  /* 數字 */
  &__status-subValue {
    font-weight: 900;
    font-size: 18px;
    line-height: 1;
  }

  /* 單位 */
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
