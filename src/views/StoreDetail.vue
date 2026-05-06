<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BasePagination from '@/components/common/BasePagination.vue';
import BusinessHoursDisplay from '@/components/store/BusinessHoursDisplay.vue';
import StoreCoverSwiper from '@/components/store/StoreCoverSwiper.vue';
import StoreProductCard from '@/components/store/StoreProductCard.vue';
import StoreProfileCard from '@/components/store/StoreProfileCard.vue';
import { useStoreDetail } from '@/composables/useStoreDetail';
import type { StoreProduct } from '@/services/storeService';

const route = useRoute();
const router = useRouter();

const {
  store,
  products,
  loading,
  productsLoading,
  error,
  page,
  size,
  total,
  totalPages,
  hasNext,
  hasPrevious,
  loadProducts,
} = useStoreDetail(route);

const productCountText = computed(() => `${total.value || products.value.length} 項上架商品`);

const goToProduct = (product: StoreProduct) => {
  router.push({ name: 'IchibanDetail', params: { id: product.id } });
};

const goToPage = () => {
  loadProducts();
};
</script>

<template>
  <div class="storeDetail">
    <div class="storeDetail__grain"></div>

    <div v-if="loading" class="storeDetail__loading">
      <div class="storeDetail__coverSkeleton"></div>
      <div class="storeDetail__panelSkeleton"></div>
      <div class="storeDetail__gridSkeleton">
        <div v-for="n in 6" :key="n" class="storeDetail__productSkeleton"></div>
      </div>
    </div>

    <div v-else-if="error" class="storeDetail__error">
      <p class="storeDetail__errorTitle">店家頁面暫時無法顯示</p>
      <p class="storeDetail__errorText">{{ error }}</p>
      <button class="storeDetail__button" @click="router.push({ name: 'StoreList' })">
        返回店家列表
      </button>
    </div>

    <template v-else-if="store">
      <section class="storeDetail__hero">
        <StoreCoverSwiper
          :images="store.coverImages ?? []"
          :fallback-url="store.coverImageUrl || store.logoUrl"
          :fallback-alt="store.name"
          class="storeDetail__cover"
        />

        <div class="storeDetail__heroOverlay">
          <p class="storeDetail__heroKicker">CURATED DRAW SPACE</p>
          <h2 class="storeDetail__heroTitle">
            探索 {{ store.name }} 的精選抽選與人氣款式
          </h2>
          <p class="storeDetail__heroMeta">
            {{ productCountText }}
            <span class="storeDetail__heroDot"></span>
            {{ store.address || '線上商店資訊已完整公開' }}
          </p>
        </div>
      </section>

      <div v-if="!store.isActive" class="storeDetail__inactiveBanner">
        此店家目前暫停服務，部分商品資訊可能僅供瀏覽。
      </div>

      <section class="storeDetail__content">
        <div class="storeDetail__main">
          <StoreProfileCard :store="store" />
          <BusinessHoursDisplay
            v-if="store.businessHours !== undefined"
            :business-hours="store.businessHours"
          />
        </div>

        <aside class="storeDetail__sidePanel">
          <div class="storeDetail__statCard">
            <span class="storeDetail__statLabel">商品數量</span>
            <strong class="storeDetail__statValue">{{ total || products.length }}</strong>
          </div>
          <div class="storeDetail__statCard">
            <span class="storeDetail__statLabel">目前頁數</span>
            <strong class="storeDetail__statValue">{{ page }} / {{ totalPages }}</strong>
          </div>
          <div class="storeDetail__sideNote">
            每張卡片都可以直接進入玩法頁，繼續查看獎項、抽數與詳情。
          </div>
        </aside>
      </section>

      <section class="storeDetail__products">
        <div class="storeDetail__sectionHeader">
          <div>
            <p class="storeDetail__sectionEyebrow">STORE PICKS</p>
            <h2 class="storeDetail__sectionTitle">店內商品一覽</h2>
          </div>
          <p class="storeDetail__sectionHint">
            依後端分頁載入，每頁 {{ size }} 筆
          </p>
        </div>

        <div v-if="productsLoading" class="storeDetail__productsGrid">
          <div v-for="n in 8" :key="n" class="storeDetail__productSkeleton"></div>
        </div>

        <div v-else-if="products.length === 0" class="storeDetail__empty">
          <p class="storeDetail__emptyTitle">目前還沒有可展示的商品</p>
          <p class="storeDetail__emptyText">等店家上架後，這裡會第一時間更新。</p>
        </div>

        <div v-else class="storeDetail__productsGrid">
          <article
            v-for="product in products"
            :key="product.id"
            class="storeDetail__productSlot"
            role="button"
            tabindex="0"
            @click="goToProduct(product)"
            @keydown.enter="goToProduct(product)"
          >
            <StoreProductCard :product="product" />
          </article>
        </div>

        <div v-if="totalPages > 1" class="storeDetail__pagination">
          <BasePagination
            v-model:page="page"
            :total="total"
            :size="size"
            :total-pages="totalPages"
            :has-next="hasNext"
            :has-previous="hasPrevious"
            :max-visible="5"
            @update:page="goToPage"
          />
        </div>
      </section>
    </template>

    <div class="storeDetail__backRow">
      <button class="storeDetail__button storeDetail__button--ghost" @click="router.push({ name: 'StoreList' })">
        返回店家列表
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.storeDetail {
  --store-bg: #f8f0e8;
  --store-paper: rgba(255, 255, 255, 0.9);
  --store-ink: #221816;
  --store-muted: #73635b;
  --store-accent: #b4442b;
  --store-accent-deep: #7d2919;
  --store-line: rgba(92, 57, 39, 0.12);

  position: relative;
  max-width: 1240px;
  margin: 0 auto;
  padding: 1.5rem 1rem 4rem;
  color: var(--store-ink);
}

.storeDetail__grain {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at top left, rgba(214, 130, 72, 0.13), transparent 26%),
    radial-gradient(circle at right 12%, rgba(157, 63, 44, 0.08), transparent 20%),
    linear-gradient(180deg, rgba(248, 240, 232, 0.92), rgba(255, 251, 247, 0.9));
  border-radius: 2rem;
}

.storeDetail__loading,
.storeDetail__content,
.storeDetail__products,
.storeDetail__hero,
.storeDetail__backRow,
.storeDetail__error,
.storeDetail__inactiveBanner {
  position: relative;
  z-index: 1;
}

.storeDetail__loading {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.storeDetail__coverSkeleton,
.storeDetail__panelSkeleton,
.storeDetail__productSkeleton {
  background: linear-gradient(90deg, rgba(239, 229, 222, 0.9) 25%, rgba(249, 243, 239, 1) 50%, rgba(239, 229, 222, 0.9) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.45s infinite linear;
}

.storeDetail__coverSkeleton {
  aspect-ratio: 16 / 7;
  border-radius: 1.8rem;
}

.storeDetail__panelSkeleton {
  height: 16rem;
  border-radius: 1.5rem;
}

.storeDetail__gridSkeleton,
.storeDetail__productsGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.storeDetail__productSkeleton {
  height: 18rem;
  border-radius: 1.35rem;
}

.storeDetail__hero {
  position: relative;
  overflow: hidden;
  border-radius: 1.8rem;
  box-shadow: 0 30px 60px rgba(77, 39, 18, 0.18);
}

.storeDetail__cover {
  min-height: 22rem;
}

.storeDetail__heroOverlay {
  position: absolute;
  inset: auto 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 2rem 1.5rem 1.4rem;
  background: linear-gradient(180deg, transparent, rgba(30, 19, 16, 0.78));
}

.storeDetail__heroKicker,
.storeDetail__sectionEyebrow {
  margin: 0;
  color: rgba(255, 239, 229, 0.92);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.storeDetail__heroTitle {
  margin: 0;
  max-width: 42rem;
  color: #fff8f2;
  font-size: clamp(1.75rem, 4vw, 3rem);
  font-weight: 900;
  line-height: 1.08;
}

.storeDetail__heroMeta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin: 0;
  color: rgba(255, 239, 229, 0.84);
  font-size: 0.92rem;
}

.storeDetail__heroDot {
  width: 0.35rem;
  height: 0.35rem;
  border-radius: 999px;
  background: rgba(255, 239, 229, 0.7);
}

.storeDetail__inactiveBanner {
  margin-top: 1rem;
  padding: 0.95rem 1.1rem;
  border: 1px solid rgba(166, 56, 56, 0.22);
  border-radius: 1rem;
  background: rgba(255, 240, 240, 0.9);
  color: #8b2d2d;
  font-weight: 700;
}

.storeDetail__content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 18rem;
  gap: 1rem;
  margin-top: 1.2rem;
}

.storeDetail__main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.storeDetail__sidePanel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.storeDetail__statCard,
.storeDetail__sideNote {
  padding: 1.15rem;
  border-radius: 1.35rem;
  border: 1px solid var(--store-line);
  background: var(--store-paper);
  box-shadow: 0 18px 36px rgba(77, 39, 18, 0.08);
}

.storeDetail__statLabel {
  display: block;
  margin-bottom: 0.45rem;
  color: var(--store-muted);
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.storeDetail__statValue {
  font-size: 2rem;
  font-weight: 900;
  color: var(--store-accent-deep);
}

.storeDetail__sideNote {
  color: var(--store-muted);
  line-height: 1.7;
  font-size: 0.92rem;
}

.storeDetail__products {
  margin-top: 1.4rem;
  padding: 1.25rem;
  border: 1px solid var(--store-line);
  border-radius: 1.8rem;
  background: rgba(255, 252, 249, 0.82);
  box-shadow: 0 24px 48px rgba(77, 39, 18, 0.08);
}

.storeDetail__sectionHeader {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: end;
  margin-bottom: 1rem;
}

.storeDetail__sectionEyebrow {
  color: var(--store-accent);
}

.storeDetail__sectionTitle {
  margin: 0.35rem 0 0;
  font-size: clamp(1.35rem, 3vw, 2.1rem);
  font-weight: 900;
}

.storeDetail__sectionHint {
  margin: 0;
  color: var(--store-muted);
  font-size: 0.9rem;
}

.storeDetail__productSlot {
  cursor: pointer;
  border-radius: 1.35rem;
  outline: none;
}

.storeDetail__productSlot:focus-visible {
  box-shadow: 0 0 0 3px rgba(180, 68, 43, 0.24);
}

.storeDetail__empty,
.storeDetail__error {
  padding: 3rem 1.25rem;
  border: 1px solid var(--store-line);
  border-radius: 1.5rem;
  background: rgba(255, 252, 249, 0.92);
  text-align: center;
}

.storeDetail__emptyTitle,
.storeDetail__errorTitle {
  margin: 0 0 0.45rem;
  font-size: 1.25rem;
  font-weight: 900;
}

.storeDetail__emptyText,
.storeDetail__errorText {
  margin: 0;
  color: var(--store-muted);
  line-height: 1.7;
}

.storeDetail__pagination,
.storeDetail__backRow {
  margin-top: 1.25rem;
}

.storeDetail__button {
  padding: 0.85rem 1.25rem;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--store-accent), #d66e3b);
  color: #fff;
  font-size: 0.92rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 16px 30px rgba(180, 68, 43, 0.2);
}

.storeDetail__button--ghost {
  background: transparent;
  color: var(--store-accent-deep);
  border: 1px solid rgba(180, 68, 43, 0.25);
  box-shadow: none;
}

@media (max-width: 1023px) {
  .storeDetail__content {
    grid-template-columns: 1fr;
  }

  .storeDetail__sidePanel {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .storeDetail {
    padding-inline: 0.75rem;
  }

  .storeDetail__cover {
    min-height: 17rem;
  }

  .storeDetail__heroOverlay {
    padding: 1.2rem 1rem 1rem;
  }

  .storeDetail__gridSkeleton,
  .storeDetail__productsGrid,
  .storeDetail__sidePanel {
    grid-template-columns: 1fr;
  }

  .storeDetail__products {
    padding: 1rem;
  }

  .storeDetail__sectionHeader {
    flex-direction: column;
    align-items: start;
  }
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}
</style>
