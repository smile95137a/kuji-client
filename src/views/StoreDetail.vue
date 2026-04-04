<template>
  <div class="storeDetail">
    <!-- 載入中 -->
    <div v-if="loading" class="storeDetail__loading">
      <div class="storeDetail__coverSkeleton"></div>
      <div class="storeDetail__infoSkeleton"></div>
    </div>

    <!-- 錯誤 -->
    <div v-else-if="error" class="storeDetail__error">
      <p>{{ error }}</p>
      <button class="storeDetail__btn" @click="$router.push({ name: 'StoreList' })">
        返回店家列表
      </button>
    </div>

    <!-- 內容 -->
    <template v-else-if="store">
      <!-- 封面輪播 -->
      <StoreCoverSwiper
        :images="store.coverImages ?? []"
        :fallback-url="store.logoUrl"
        :fallback-alt="store.name"
        class="storeDetail__cover"
      />

      <!-- 暫停服務橫幅 -->
      <div v-if="!store.isActive" class="storeDetail__inactiveBanner">
        🚫 此店家目前暫停服務
      </div>

      <!-- 基本資訊 -->
      <section class="storeDetail__info">
        <div class="storeDetail__logoRow">
          <img v-if="store.logoUrl" :src="store.logoUrl" :alt="store.name" class="storeDetail__logo" />
          <div>
            <h1 class="storeDetail__name">{{ store.name }}</h1>
            <p v-if="store.description" class="storeDetail__desc">{{ store.description }}</p>
          </div>
        </div>

        <div v-if="store.address || store.phone" class="storeDetail__contactRow">
          <p v-if="store.address" class="storeDetail__contact">
            📍 {{ store.address }}
          </p>
          <p v-if="store.phone" class="storeDetail__contact">
            📞 <a :href="`tel:${store.phone}`">{{ store.phone }}</a>
          </p>
        </div>
      </section>

      <!-- 營業時間 -->
      <BusinessHoursDisplay
        v-if="store.businessHours !== undefined"
        :business-hours="store.businessHours"
      />

      <!-- 商品列表 -->
      <section class="storeDetail__products">
        <h2 class="storeDetail__productsTitle">店家商品</h2>

        <div v-if="productsLoading" class="storeDetail__productsGrid">
          <div v-for="n in 4" :key="n" class="storeDetail__productSkeleton"></div>
        </div>

        <div v-else-if="products.length === 0" class="storeDetail__empty">
          <p>此店家目前沒有商品</p>
        </div>

        <div v-else class="storeDetail__productsGrid">
          <article
            v-for="product in products"
            :key="product.id"
            class="storeDetail__productCard"
            @click="goToProduct(product)"
            role="button"
            tabindex="0"
            @keydown.enter="goToProduct(product)"
          >
            <div class="storeDetail__productImgWrap">
              <img
                :src="product.imageUrl || product.bannerImageUrl"
                :alt="product.title"
                class="storeDetail__productImg"
              />
              <div v-if="product.status === 'SOLD_OUT'" class="storeDetail__soldOut">已售完</div>
            </div>
            <div class="storeDetail__productInfo">
              <p class="storeDetail__productName">{{ product.title }}</p>
              <p v-if="product.pricePerDraw" class="storeDetail__productPrice">
                {{ Number(product.pricePerDraw).toLocaleString('zh-TW') }} 元 / 抽
              </p>
            </div>
          </article>
        </div>
      </section>
    </template>

    <!-- 返回按鈕 -->
    <div class="storeDetail__backRow">
      <button class="storeDetail__btn storeDetail__btn--ghost" @click="$router.push({ name: 'StoreList' })">
        ← 返回店家列表
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import StoreCoverSwiper from '@/components/store/StoreCoverSwiper.vue';
import BusinessHoursDisplay from '@/components/store/BusinessHoursDisplay.vue';
import { getStoreDetail, getStoreProducts, type StoreDetail } from '@/services/storeService';

const route = useRoute();
const router = useRouter();

const store = ref<StoreDetail | null>(null);
const products = ref<any[]>([]);
const loading = ref(true);
const productsLoading = ref(true);
const error = ref('');

const goToProduct = (product: any) => {
  router.push({ name: 'IchibanDetail', params: { id: product.id } });
};

onMounted(async () => {
  const id = String(route.params.id);

  // 並行載入店家資訊與商品
  const [storeResult, productsResult] = await Promise.allSettled([
    getStoreDetail(id),
    getStoreProducts(id),
  ]);

  loading.value = false;
  productsLoading.value = false;

  if (storeResult.status === 'fulfilled') {
    store.value = (storeResult.value as any)?.data ?? null;
    if (!store.value) {
      error.value = '找不到此店家';
    }
  } else {
    const status = (storeResult.reason as any)?.response?.status;
    if (status === 404) {
      error.value = '找不到此店家';
    } else if (status === 403) {
      error.value = '您沒有權限查看此店家';
    } else {
      error.value = '載入失敗，請稍後再試';
    }
  }

  if (productsResult.status === 'fulfilled') {
    products.value = (productsResult.value as any)?.data ?? [];
  }
});
</script>

<style scoped lang="scss">
.storeDetail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px 48px;
  display: flex;
  flex-direction: column;
  gap: 24px;

  &__cover {
    border-radius: 16px;
    overflow: hidden;
  }

  &__coverSkeleton {
    aspect-ratio: 16 / 9;
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 16px;
  }

  &__infoSkeleton {
    height: 120px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 12px;
  }

  &__inactiveBanner {
    background: #fff3cd;
    border: 1px solid #ffc107;
    color: #856404;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__logoRow {
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }

  &__logo {
    width: 64px;
    height: 64px;
    object-fit: cover;
    border-radius: 12px;
    border: 2px solid #eee;
    flex-shrink: 0;
  }

  &__name {
    font-size: 1.6rem;
    font-weight: 900;
    margin: 0 0 4px;
    color: #111;
  }

  &__desc {
    font-size: 0.9rem;
    color: #555;
    margin: 0;
    line-height: 1.6;
  }

  &__contactRow {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__contact {
    font-size: 0.9rem;
    color: #666;
    margin: 0;

    a {
      color: #b2473a;
      text-decoration: none;
      &:hover { text-decoration: underline; }
    }
  }

  &__products {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__productsTitle {
    font-size: 1.3rem;
    font-weight: 800;
    margin: 0;
    color: #111;
    border-left: 4px solid #b2473a;
    padding-left: 12px;
  }

  &__productsGrid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;

    @media (min-width: 640px) {
      grid-template-columns: repeat(3, 1fr);
    }

    @media (min-width: 1024px) {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  &__productSkeleton {
    height: 200px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 10px;
  }

  &__productCard {
    background: #fff;
    border-radius: 10px;
    border: 1.5px solid #eee;
    cursor: pointer;
    transition: box-shadow 0.2s, transform 0.15s;
    overflow: hidden;

    &:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transform: translateY(-2px);
    }
  }

  &__productImgWrap {
    position: relative;
    aspect-ratio: 1 / 1;
    background: #f5f5f5;
  }

  &__productImg {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__soldOut {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.45);
    color: #fff;
    font-size: 0.9rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__productInfo {
    padding: 8px 10px;
  }

  &__productName {
    font-size: 0.85rem;
    font-weight: 600;
    color: #222;
    margin: 0 0 4px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__productPrice {
    font-size: 0.8rem;
    color: #b2473a;
    font-weight: 700;
    margin: 0;
  }

  &__empty {
    text-align: center;
    padding: 40px 16px;
    color: #888;
    font-size: 0.95rem;
  }

  &__error {
    text-align: center;
    padding: 60px 16px;
    color: #555;

    p { margin: 0 0 16px; font-size: 1rem; }
  }

  &__loading {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__backRow {
    padding-top: 8px;
  }

  &__btn {
    padding: 10px 20px;
    background: #b2473a;
    color: #fff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    transition: background 0.2s;

    &:hover { background: #9a3b30; }

    &--ghost {
      background: transparent;
      color: #b2473a;
      border: 1.5px solid #b2473a;

      &:hover { background: #b2473a11; }
    }
  }
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
