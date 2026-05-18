<!-- src/views/StoreDetail.vue -->
<template>
  <div class="storeDetail">
    <!-- Loading -->
    <div v-if="loading" class="storeDetail__container storeDetail__loading">
      <div class="storeDetail__loadingCover"></div>
      <div class="storeDetail__loadingPanel"></div>
      <div class="storeDetail__loadingGrid">
        <div v-for="n in 4" :key="n" class="storeDetail__loadingCard"></div>
      </div>
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="storeDetail__container storeDetail__stateWrap"
    >
      <div class="storeDetail__state">
        <div class="storeDetail__stateIcon">!</div>
        <h1 class="storeDetail__stateTitle">店家資料載入失敗</h1>
        <p class="storeDetail__stateText">{{ error }}</p>
        <button class="storeDetail__primaryBtn" type="button" @click="goBack">
          返回店家列表
        </button>
      </div>
    </div>

    <template v-else-if="store">
      <!-- Cover -->
      <section class="storeDetail__coverSection">
        <button class="storeDetail__backBtn" type="button" @click="goBack">
          返回店家列表
        </button>

        <div class="storeDetail__coverFrame">
          <img
            v-if="store.coverImageUrl"
            class="storeDetail__coverImg"
            :src="store.coverImageUrl"
            :alt="store.storeName"
          />
          <div v-else class="storeDetail__coverFallback">
            {{ getInitial(store.storeName) }}
          </div>
        </div>
      </section>

      <!-- Store Header Card -->
      <section class="storeDetail__profileSection">
        <div class="storeDetail__container">
          <div class="storeDetail__profileCard">
            <div class="storeDetail__logoBox">
              <img
                v-if="store.logoUrl"
                class="storeDetail__logo"
                :src="store.logoUrl"
                :alt="store.storeName"
              />
              <div v-else class="storeDetail__logoFallback">
                {{ getInitial(store.storeName) }}
              </div>
            </div>

            <div class="storeDetail__profileMain">
              <p class="storeDetail__label">KUJI PARTNER STORE</p>
              <h1 class="storeDetail__storeName">{{ store.storeName }}</h1>
              <p class="storeDetail__storeDesc">
                {{ store.shortDescription || '店家目前尚未提供簡介。' }}
              </p>

              <div class="storeDetail__chips">
                <span class="storeDetail__chip">合作店家</span>
                <span class="storeDetail__chip">{{ productTotal }} 個商品</span>
                <span v-if="store.businessHours" class="storeDetail__chip">
                  {{ store.businessHours }}
                </span>
              </div>
            </div>

            <div class="storeDetail__profileAction">
              <button
                class="storeDetail__secondaryBtn"
                type="button"
                @click="scrollToProducts"
              >
                查看商品
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Info -->
      <section class="storeDetail__infoSection">
        <div class="storeDetail__container">
          <div class="storeDetail__infoGrid">
            <article class="storeDetail__introCard">
              <div class="storeDetail__sectionHead">
                <p class="storeDetail__sectionKicker">ABOUT</p>
                <h2 class="storeDetail__sectionTitle">店家介紹</h2>
              </div>

              <p class="storeDetail__introText">
                {{
                  store.longDescription ||
                  store.shortDescription ||
                  '這間店家目前尚未提供詳細介紹。'
                }}
              </p>
            </article>

            <aside class="storeDetail__sideStack">
              <article class="storeDetail__miniCard">
                <p class="storeDetail__miniLabel">營業時間</p>
                <p class="storeDetail__miniValue">
                  {{ store.businessHours || '尚未提供' }}
                </p>
              </article>

              <article class="storeDetail__miniCard">
                <p class="storeDetail__miniLabel">店內商品</p>
                <p class="storeDetail__miniNumber">{{ productTotal }}</p>
              </article>
            </aside>
          </div>

          <div class="storeDetail__contactCard">
            <div class="storeDetail__sectionHead">
              <p class="storeDetail__sectionKicker">CONTACT</p>
              <h2 class="storeDetail__sectionTitle">聯絡資訊</h2>
            </div>

            <div class="storeDetail__contactGrid">
              <div v-if="store.phone" class="storeDetail__contactItem">
                <span class="storeDetail__contactLabel">電話</span>
                <strong class="storeDetail__contactValue">{{
                  store.phone
                }}</strong>
              </div>

              <div v-if="store.email" class="storeDetail__contactItem">
                <span class="storeDetail__contactLabel">Email</span>
                <strong class="storeDetail__contactValue">{{
                  store.email
                }}</strong>
              </div>

              <div v-if="store.address" class="storeDetail__contactItem">
                <span class="storeDetail__contactLabel">地址</span>
                <strong class="storeDetail__contactValue">{{
                  store.address
                }}</strong>
              </div>

              <div v-if="store.lineId" class="storeDetail__contactItem">
                <span class="storeDetail__contactLabel">LINE</span>
                <strong class="storeDetail__contactValue">{{
                  store.lineId
                }}</strong>
              </div>

              <p
                v-if="
                  !store.phone &&
                  !store.email &&
                  !store.address &&
                  !store.lineId
                "
                class="storeDetail__contactEmpty"
              >
                店家尚未提供聯絡資訊。
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Products -->
      <section id="store-products" class="storeDetail__productSection">
        <div class="storeDetail__container">
          <div class="storeDetail__productHeader">
            <div>
              <p class="storeDetail__sectionKicker">STORE PICKS</p>
              <h2 class="storeDetail__sectionTitle">店內商品</h2>
              <p class="storeDetail__productDesc">
                這裡會顯示此店家目前上架的一番賞商品。
              </p>
            </div>

            <button
              class="storeDetail__outlineBtn"
              type="button"
              @click="goBack"
            >
              看其他店家
            </button>
          </div>

          <div v-if="productsLoading" class="storeDetail__productGrid">
            <div
              v-for="n in 8"
              :key="n"
              class="storeDetail__productSkeleton"
            ></div>
          </div>

          <div
            v-else-if="products.length === 0"
            class="storeDetail__emptyProducts"
          >
            <div class="storeDetail__emptyBadge">賞</div>
            <h3 class="storeDetail__emptyTitle">目前還沒有上架商品</h3>
            <p class="storeDetail__emptyText">
              這間店家暫時沒有可瀏覽的商品，可以先逛逛其他合作店家。
            </p>
            <button
              class="storeDetail__primaryBtn"
              type="button"
              @click="goBack"
            >
              探索其他店家
            </button>
          </div>

          <div v-else class="storeDetail__productGrid">
            <article
              v-for="product in products"
              :key="product.id"
              class="storeDetail__productCard"
              role="button"
              tabindex="0"
              @click="goToProduct(product)"
              @keydown.enter="goToProduct(product)"
            >
              <div class="storeDetail__productImageBox">
                <img
                  v-if="product.imageUrl || product.bannerImageUrl"
                  class="storeDetail__productImage"
                  :src="product.imageUrl || product.bannerImageUrl"
                  :alt="product.title"
                />
                <div v-else class="storeDetail__productFallback">
                  {{ getInitial(product.title) }}
                </div>
              </div>

              <div class="storeDetail__productInfo">
                <span class="storeDetail__productTag">
                  {{ product.category || product.subCategory || '一番賞' }}
                </span>

                <h3 class="storeDetail__productTitle">
                  {{ product.title || '未命名商品' }}
                </h3>

                <p class="storeDetail__productPrice">
                  {{
                    product.pricePerDraw
                      ? `$${product.pricePerDraw} / 抽`
                      : '查看商品詳情'
                  }}
                </p>
              </div>
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
        </div>
      </section>

      <!-- Bottom -->
      <section class="storeDetail__bottomSection">
        <div class="storeDetail__container">
          <div class="storeDetail__bottomCard">
            <div>
              <p class="storeDetail__bottomTitle">想逛更多合作店家？</p>
              <p class="storeDetail__bottomText">
                回到店家列表，探索更多一番賞與動漫周邊店家。
              </p>
            </div>

            <button
              class="storeDetail__bottomBtn"
              type="button"
              @click="goBack"
            >
              返回店家列表
            </button>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import BasePagination from '@/components/common/BasePagination.vue';
import { getStoreDetail, getStoreProducts } from '@/services/storeService';
import { executeApi } from '@/utils/executeApiUtils';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

type StoreDetailData = {
  id: string;
  storeName: string;
  shortDescription?: string | null;
  longDescription?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  businessHours?: string | null;
  lineId?: string | null;
  products?: ProductItem[];
};

type ProductItem = {
  id: string;
  title?: string;
  imageUrl?: string;
  bannerImageUrl?: string;
  category?: string;
  subCategory?: string;
  pricePerDraw?: number;
};

const route = useRoute();
const router = useRouter();

const store = ref<StoreDetailData | null>(null);
const products = ref<ProductItem[]>([]);
const loading = ref(false);
const productsLoading = ref(false);
const error = ref('');

const page = ref(1);
const size = ref(12);
const total = ref(0);
const totalPages = ref(0);
const hasNext = ref(false);
const hasPrevious = ref(false);

const storeId = computed(() => String(route.params.id || ''));

const productTotal = computed(() => {
  return (
    total.value || products.value.length || store.value?.products?.length || 0
  );
});

const normalizeProducts = (res: any): ProductItem[] => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  return [];
};

const normalizeProductPage = (res: any) => {
  const list = normalizeProducts(res);

  products.value = list;

  page.value = Number(res?.page ?? page.value);
  size.value = Number(res?.size ?? size.value);
  total.value = Number(res?.total ?? list.length);
  totalPages.value = Number(res?.totalPages ?? (list.length ? 1 : 0));
  hasNext.value = Boolean(res?.hasNext);
  hasPrevious.value = Boolean(res?.hasPrevious);
};

const fetchStoreDetail = async () => {
  if (!storeId.value) return;

  loading.value = true;
  error.value = '';

  await executeApi<any>({
    fn: () => getStoreDetail(storeId.value),
    showCatchDialog: false,
    onSuccess: (data) => {
      store.value = data ?? null;

      if (Array.isArray(data?.products)) {
        products.value = data.products;
      }
    },
    onFail: () => {
      error.value = '找不到店家資料。';
    },
    onFinally: () => {
      loading.value = false;
    },
  });
};

const fetchProducts = async () => {
  if (!storeId.value) return;

  productsLoading.value = true;

  await executeApi<any>({
    fn: () =>
      getStoreProducts(storeId.value, {
        page: page.value,
        size: size.value,
      }),
    showCatchDialog: false,
    onSuccess: (data) => {
      normalizeProductPage(data);
    },
    onFail: () => {
      products.value = [];
      total.value = 0;
      totalPages.value = 0;
      hasNext.value = false;
      hasPrevious.value = false;
    },
    onFinally: () => {
      productsLoading.value = false;
    },
  });
};

const goToPage = () => {
  fetchProducts();
};

const scrollToProducts = () => {
  document.getElementById('store-products')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
};

const getInitial = (text?: string | null) => {
  return String(text || 'S')
    .trim()
    .slice(0, 1)
    .toUpperCase();
};

const goBack = () => {
  router.push({ name: 'StoreList' });
};

const goToProduct = (product: ProductItem) => {
  router.push({ name: 'IchibanDetail', params: { id: product.id } });
};

const init = async () => {
  await fetchStoreDetail();
  await fetchProducts();
};

watch(
  () => route.params.id,
  () => {
    page.value = 1;
    init();
  },
);

onMounted(() => {
  init();
});
</script>

<style scoped lang="scss">
.storeDetail {
  min-height: 100vh;
  background: #f8efe3;
  color: #161616;

  &__container {
    max-width: 1180px;
    margin: 0 auto;
    padding: 0 20px;
  }

  /* Cover */
  &__coverSection {
    position: relative;
    padding: 24px 20px 0;
    background: #111;
  }

  &__backBtn {
    position: absolute;
    z-index: 3;
    top: 42px;
    left: max(20px, calc((100vw - 1180px) / 2 + 20px));

    height: 38px;
    padding: 0 14px;
    border-radius: 999px;
    border: 1px solid rgba(224, 188, 148, 0.42);
    background: rgba(0, 0, 0, 0.42);
    color: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(10px);
    cursor: pointer;

    font-size: 13px;
    font-weight: 900;
  }

  &__coverFrame {
    max-width: 1180px;
    height: 430px;
    margin: 0 auto;
    overflow: hidden;
    border-radius: 32px 32px 0 0;
    background: #211916;
  }

  &__coverImg,
  &__coverFallback {
    width: 100%;
    height: 100%;
  }

  &__coverImg {
    display: block;
    object-fit: cover;
  }

  &__coverFallback {
    display: grid;
    place-items: center;
    background:
      radial-gradient(
        circle at 20% 10%,
        rgba(224, 188, 148, 0.28),
        transparent 30%
      ),
      linear-gradient(135deg, #b43325, #7a1a12);
    color: #fff;
    font-size: 72px;
    font-weight: 1000;
  }

  /* Profile */
  &__profileSection {
    background: linear-gradient(180deg, #111 0, #111 76px, #f8efe3 76px);
    padding-bottom: 28px;
  }

  &__profileCard {
    position: relative;
    display: grid;
    grid-template-columns: 132px minmax(0, 1fr) auto;
    gap: 22px;
    align-items: center;

    padding: 22px;
    border-radius: 28px;

    background: rgba(255, 255, 255, 0.94);
    border: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow: 0 22px 50px rgba(45, 20, 10, 0.16);
  }

  &__logoBox {
    width: 132px;
    height: 132px;
    padding: 8px;
    border-radius: 30px;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 14px 28px rgba(45, 20, 10, 0.14);
  }

  &__logo,
  &__logoFallback {
    width: 100%;
    height: 100%;
    border-radius: 23px;
  }

  &__logo {
    display: block;
    object-fit: cover;
  }

  &__logoFallback {
    display: grid;
    place-items: center;
    background: linear-gradient(135deg, #b43325, #7a1a12);
    color: #fff;
    font-size: 42px;
    font-weight: 1000;
  }

  &__label,
  &__sectionKicker {
    display: inline-flex;
    align-items: center;
    width: fit-content;
    height: 26px;
    padding: 0 11px;
    border-radius: 999px;
    margin: 0 0 10px;

    background: rgba(180, 51, 37, 0.08);
    border: 1px solid rgba(180, 51, 37, 0.14);
    color: #b43325;

    font-size: 12px;
    font-weight: 1000;
    letter-spacing: 2px;
  }

  &__storeName {
    margin: 0;
    color: #111;
    font-size: clamp(28px, 4vw, 46px);
    line-height: 1.08;
    font-weight: 1000;
  }

  &__storeDesc {
    max-width: 640px;
    margin: 12px 0 0;
    color: rgba(0, 0, 0, 0.66);
    font-size: 15px;
    line-height: 1.8;
  }

  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
  }

  &__chip {
    min-height: 30px;
    padding: 0 11px;
    border-radius: 999px;

    display: inline-flex;
    align-items: center;

    background: #f8efe3;
    color: rgba(0, 0, 0, 0.72);
    border: 1px solid rgba(180, 51, 37, 0.08);

    font-size: 13px;
    font-weight: 900;
  }

  &__profileAction {
    align-self: end;
  }

  /* Info */
  &__infoSection {
    padding: 0 0 32px;
  }

  &__infoGrid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 320px;
    gap: 18px;
    align-items: stretch;
  }

  &__introCard,
  &__miniCard,
  &__contactCard {
    background: rgba(255, 255, 255, 0.84);
    border: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow: 0 14px 34px rgba(45, 20, 10, 0.07);
  }

  &__introCard {
    min-height: 230px;
    padding: 26px;
    border-radius: 28px;
    background:
      radial-gradient(
        circle at 0% 0%,
        rgba(224, 188, 148, 0.22),
        transparent 35%
      ),
      rgba(255, 255, 255, 0.88);
  }

  &__sectionTitle {
    margin: 0;
    font-size: 26px;
    font-weight: 1000;
    letter-spacing: 0.5px;
  }

  &__introText {
    margin: 16px 0 0;
    color: rgba(0, 0, 0, 0.68);
    font-size: 15px;
    line-height: 1.9;
  }

  &__sideStack {
    display: grid;
    gap: 14px;
  }

  &__miniCard {
    padding: 20px;
    border-radius: 24px;
  }

  &__miniLabel {
    margin: 0 0 8px;
    color: rgba(0, 0, 0, 0.52);
    font-size: 12px;
    font-weight: 1000;
    letter-spacing: 1px;
  }

  &__miniValue {
    margin: 0;
    color: rgba(0, 0, 0, 0.75);
    font-size: 16px;
    font-weight: 1000;
    line-height: 1.6;
  }

  &__miniNumber {
    margin: 0;
    color: #b43325;
    font-size: 42px;
    line-height: 1;
    font-weight: 1000;
  }

  &__contactCard {
    margin-top: 18px;
    padding: 24px;
    border-radius: 28px;
  }

  &__contactGrid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-top: 16px;
  }

  &__contactItem {
    min-height: 82px;
    padding: 14px;
    border-radius: 18px;
    background: #f8efe3;
    border: 1px solid rgba(180, 51, 37, 0.08);
  }

  &__contactLabel {
    display: block;
    margin-bottom: 6px;
    color: rgba(0, 0, 0, 0.48);
    font-size: 12px;
    font-weight: 1000;
    letter-spacing: 1px;
  }

  &__contactValue {
    display: block;
    color: rgba(0, 0, 0, 0.76);
    font-size: 14px;
    line-height: 1.6;
    word-break: break-word;
  }

  &__contactEmpty {
    margin: 0;
    color: rgba(0, 0, 0, 0.6);
    font-size: 14px;
  }

  /* Products */
  &__productSection {
    padding: 34px 0 0;
    background: #fffaf4;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
  }

  &__productHeader {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 18px;
  }

  &__productDesc {
    margin: 8px 0 0;
    color: rgba(0, 0, 0, 0.62);
    font-size: 14px;
    line-height: 1.7;
  }

  &__productGrid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
  }

  &__productCard {
    overflow: hidden;
    border-radius: 24px;
    cursor: pointer;

    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow: 0 14px 34px rgba(45, 20, 10, 0.07);

    transition:
      transform 0.18s ease,
      box-shadow 0.18s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 44px rgba(45, 20, 10, 0.13);
    }
  }

  &__productImageBox {
    height: 210px;
    background: #efe2d3;
  }

  &__productImage,
  &__productFallback {
    width: 100%;
    height: 100%;
  }

  &__productImage {
    display: block;
    object-fit: cover;
  }

  &__productFallback {
    display: grid;
    place-items: center;
    background: linear-gradient(135deg, #e0bc94, #b43325);
    color: #fff;
    font-size: 36px;
    font-weight: 1000;
  }

  &__productInfo {
    padding: 16px;
  }

  &__productTag {
    display: inline-flex;
    width: fit-content;
    height: 24px;
    padding: 0 10px;
    margin-bottom: 10px;
    align-items: center;
    border-radius: 999px;

    background: rgba(180, 51, 37, 0.08);
    color: #b43325;

    font-size: 12px;
    font-weight: 1000;
  }

  &__productTitle {
    margin: 0 0 8px;
    color: #111;
    font-size: 16px;
    font-weight: 1000;
    line-height: 1.45;
  }

  &__productPrice {
    margin: 0;
    color: rgba(0, 0, 0, 0.58);
    font-size: 14px;
    font-weight: 900;
  }

  &__emptyProducts,
  &__state {
    padding: 54px 20px;
    border-radius: 30px;
    text-align: center;

    background:
      radial-gradient(
        circle at 50% 0%,
        rgba(224, 188, 148, 0.24),
        transparent 34%
      ),
      rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow: 0 14px 34px rgba(45, 20, 10, 0.07);
  }

  &__emptyBadge,
  &__stateIcon {
    width: 68px;
    height: 68px;
    margin: 0 auto 14px;
    border-radius: 22px;

    display: grid;
    place-items: center;

    background: rgba(180, 51, 37, 0.08);
    color: #b43325;

    font-size: 20px;
    font-weight: 1000;
  }

  &__emptyTitle,
  &__stateTitle {
    margin: 0 0 8px;
    color: #111;
    font-size: 22px;
    font-weight: 1000;
  }

  &__emptyText,
  &__stateText {
    margin: 0 0 18px;
    color: rgba(0, 0, 0, 0.62);
    font-size: 14px;
    line-height: 1.7;
  }

  &__pagination {
    margin-top: 24px;
  }

  /* Bottom */
  &__bottomSection {
    padding: 32px 0 48px;
    background: #fffaf4;
  }

  &__bottomCard {
    padding: 22px;
    border-radius: 28px;

    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;

    background:
      radial-gradient(
        circle at 10% 0%,
        rgba(224, 188, 148, 0.22),
        transparent 36%
      ),
      linear-gradient(135deg, #b43325, #7a1a12);
    color: #fff;
  }

  &__bottomTitle {
    margin: 0 0 4px;
    font-size: 21px;
    font-weight: 1000;
  }

  &__bottomText {
    margin: 0;
    color: rgba(255, 255, 255, 0.82);
    font-size: 14px;
    line-height: 1.7;
  }

  /* Buttons */
  &__primaryBtn,
  &__secondaryBtn,
  &__outlineBtn,
  &__bottomBtn {
    height: 42px;
    padding: 0 18px;
    border-radius: 999px;
    cursor: pointer;

    font-size: 14px;
    font-weight: 1000;
    letter-spacing: 0.5px;
  }

  &__primaryBtn {
    border: 1px solid #b43325;
    background: #b43325;
    color: #fff;
  }

  &__secondaryBtn,
  &__bottomBtn {
    border: 0;
    background: #e0bc94;
    color: #111;
  }

  &__outlineBtn {
    border: 1px solid rgba(0, 0, 0, 0.1);
    background: #fff;
    color: #111;
  }

  /* Loading */
  &__loading {
    padding-top: 28px;
    padding-bottom: 48px;
  }

  &__loadingCover,
  &__loadingPanel,
  &__loadingCard,
  &__productSkeleton {
    position: relative;
    overflow: hidden;
    background: #eee2d4;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      transform: translateX(-100%);
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.58),
        transparent
      );
      animation: shimmer 1.35s infinite;
    }
  }

  &__loadingCover {
    height: 430px;
    border-radius: 32px;
    background: #211916;
    margin-bottom: 18px;
  }

  &__loadingPanel {
    height: 180px;
    border-radius: 28px;
    margin-bottom: 18px;
  }

  &__loadingGrid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
  }

  &__loadingCard,
  &__productSkeleton {
    height: 290px;
    border-radius: 24px;
  }

  &__stateWrap {
    padding-top: 42px;
    padding-bottom: 48px;
  }

  @media (max-width: 1080px) {
    &__profileCard {
      grid-template-columns: 112px minmax(0, 1fr);
    }

    &__profileAction {
      grid-column: 1 / -1;
      justify-self: start;
    }

    &__logoBox {
      width: 112px;
      height: 112px;
    }

    &__infoGrid {
      grid-template-columns: 1fr;
    }

    &__sideStack {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    &__contactGrid,
    &__productGrid,
    &__loadingGrid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: 820px) {
    &__coverFrame {
      height: 330px;
    }

    &__profileCard {
      grid-template-columns: 1fr;
      text-align: left;
    }

    &__contactGrid,
    &__productGrid,
    &__loadingGrid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    &__productHeader {
      align-items: stretch;
      flex-direction: column;
    }
  }

  @media (max-width: 640px) {
    &__container {
      padding: 0 16px;
    }

    &__coverSection {
      padding: 16px 16px 0;
    }

    &__backBtn {
      top: 28px;
      left: 28px;
    }

    &__coverFrame {
      height: 250px;
      border-radius: 24px 24px 0 0;
    }

    &__profileCard {
      padding: 18px;
      border-radius: 24px;
    }

    &__logoBox {
      width: 92px;
      height: 92px;
      border-radius: 24px;
    }

    &__storeName {
      font-size: 30px;
    }

    &__sideStack,
    &__contactGrid,
    &__productGrid,
    &__loadingGrid {
      grid-template-columns: 1fr;
    }

    &__bottomCard {
      align-items: stretch;
    }

    &__primaryBtn,
    &__secondaryBtn,
    &__outlineBtn,
    &__bottomBtn {
      width: 100%;
    }
  }
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
