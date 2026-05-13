<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { StoreProduct } from '@/services/storeService';

const props = defineProps<{
  product: StoreProduct;
}>();

const normalizedCategory = computed(() => String(props.product.category ?? '').toUpperCase());

const normalizedSubCategory = computed(() =>
  String(props.product.subCategory ?? '').toUpperCase(),
);

const normalizedPlayMode = computed(() =>
  String(props.product.playMode ?? '').toUpperCase(),
);

const categoryLabel = computed(() => {
  if (
    normalizedPlayMode.value === 'SCRATCH_MODE' ||
    normalizedSubCategory.value === 'SCRATCH_MODE'
  ) {
    return '刮刮樂';
  }

  if (normalizedCategory.value === 'CUSTOM_GACHA') {
    return '自製一番賞';
  }

  if (normalizedCategory.value === 'OFFICIAL_ICHIBAN') {
    return '一番賞';
  }

  if (normalizedCategory.value === 'GACHA') {
    return '扭蛋';
  }

  if (normalizedCategory.value === 'TRADING_CARD') {
    return '卡牌';
  }

  return '商品';
});

const displayPrice = computed(() =>
  Number(props.product.pricePerDraw ?? 0).toLocaleString('zh-TW'),
);

const defaultProductImage = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f8d7c0"/><stop offset="100%" stop-color="#f2b17d"/></linearGradient></defs><rect width="800" height="800" fill="url(#g)"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#8a3a27" font-family="Arial" font-size="96" font-weight="700">KUJI</text></svg>',
)}`;

const imageCandidates = computed(() => {
  const candidates = [
    props.product.imageUrl,
    props.product.bannerImageUrl,
    defaultProductImage,
  ]
    .map((item) => String(item ?? '').trim())
    .filter(Boolean);

  return Array.from(new Set(candidates));
});

const activeImageUrl = ref(defaultProductImage);
const imageLoaded = ref(false);

watch(
  imageCandidates,
  (candidates) => {
    activeImageUrl.value = candidates[0] ?? defaultProductImage;
    imageLoaded.value = false;
  },
  { immediate: true },
);

const onImageLoad = () => {
  imageLoaded.value = true;
};

const onImageError = () => {
  const candidates = imageCandidates.value;
  const currentIndex = candidates.indexOf(activeImageUrl.value);
  const nextUrl = currentIndex >= 0 ? candidates[currentIndex + 1] : '';

  activeImageUrl.value = nextUrl || defaultProductImage;
  imageLoaded.value = false;
};

const normalizedStatus = computed(() =>
  String(props.product.status ?? '').toUpperCase(),
);

const statusLabel = computed(() => {
  if (normalizedStatus.value === 'GRAND_PRIZE_DRAWN') return '大獎已抽完';
  if (normalizedStatus.value === 'ALL_DRAWN') {
    return '已售完';
  }
  if (['OFF_SHELF', 'FORCED_OFF', 'DELETED', 'INACTIVE'].includes(normalizedStatus.value)) {
    return '已下架';
  }
  return '';
});
</script>

<template>
  <article class="storeProductCard">
    <div class="storeProductCard__imageWrap">
      <img
        :src="activeImageUrl"
        :alt="product.title"
        class="storeProductCard__image"
        :class="{ 'storeProductCard__image--ready': imageLoaded }"
        @load="onImageLoad"
        @error="onImageError"
      />
      <div v-if="!imageLoaded" class="storeProductCard__imageSkeleton"></div>

      <div class="storeProductCard__topRow">
        <span class="storeProductCard__category">{{ categoryLabel }}</span>
        <span v-if="statusLabel" class="storeProductCard__status">{{ statusLabel }}</span>
      </div>
    </div>

    <div class="storeProductCard__body">
      <h3 class="storeProductCard__title">{{ product.title }}</h3>

      <div class="storeProductCard__stats">
        <div class="storeProductCard__stat">
          <span class="storeProductCard__statLabel">單抽價格</span>
          <span class="storeProductCard__statValue">NT$ {{ displayPrice }}</span>
        </div>

        <div class="storeProductCard__stat">
          <span class="storeProductCard__statLabel">總抽數</span>
          <span class="storeProductCard__statValue">
            {{ product.maxDraws ? `${product.maxDraws} 抽` : '未提供' }}
          </span>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped lang="scss">
.storeProductCard {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  overflow: hidden;
  border-radius: 1.35rem;
  border: 1px solid rgba(110, 74, 54, 0.12);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 18px 40px rgba(68, 39, 21, 0.08);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.storeProductCard:hover {
  transform: translateY(-4px);
  border-color: rgba(180, 68, 43, 0.28);
  box-shadow: 0 26px 48px rgba(68, 39, 21, 0.14);
}

.storeProductCard__imageWrap {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(255, 235, 220, 0.9), rgba(255, 248, 240, 0.7));
}

.storeProductCard__image {
  opacity: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition:
    transform 0.3s ease,
    opacity 0.22s ease;
}

.storeProductCard__image--ready {
  opacity: 1;
}

.storeProductCard__imageSkeleton {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #f4ece6 25%, #f9f2eb 50%, #f4ece6 75%);
  background-size: 200% 100%;
  animation: storeProductShimmer 1.25s linear infinite;
}

.storeProductCard:hover .storeProductCard__image {
  transform: scale(1.04);
}

.storeProductCard__topRow {
  position: absolute;
  inset: 0 0 auto 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.9rem;
}

.storeProductCard__category,
.storeProductCard__status {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.7rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.storeProductCard__category {
  color: #9a3f2e;
  background: rgba(255, 248, 244, 0.9);
  backdrop-filter: blur(8px);
}

.storeProductCard__status {
  color: #fff;
  background: rgba(44, 28, 28, 0.78);
}

.storeProductCard__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.95rem;
  padding: 1rem;
}

.storeProductCard__title {
  margin: 0;
  color: #231917;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.45;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.storeProductCard__stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.storeProductCard__stat {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.85rem 0.9rem;
  border-radius: 1rem;
  background: rgba(252, 246, 241, 0.88);
}

.storeProductCard__statLabel {
  color: #8a6f63;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.storeProductCard__statValue {
  color: #221816;
  font-size: 0.92rem;
  font-weight: 800;
}

@keyframes storeProductShimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

@media (max-width: 480px) {
  .storeProductCard__stats {
    grid-template-columns: 1fr;
  }
}
</style>
