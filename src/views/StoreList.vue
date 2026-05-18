<!-- src/views/StoreList.vue -->
<template>
  <div class="storeList">
    <!-- Hero -->
    <section class="storeList__hero">
      <div class="storeList__heroInner">
        <div class="storeList__heroContent">
          <p class="storeList__badge">STORE PARTNER</p>
          <h1 class="storeList__title">精選合作店家</h1>
          <p class="storeList__subtitle">
            探索 STARDO
            合作的一番賞、動漫周邊與抽獎店家，找到你喜歡的店，開始你的抽賞旅程。
          </p>

          <div class="storeList__heroActions">
            <button
              class="storeList__heroBtn storeList__heroBtn--primary"
              type="button"
              @click="scrollToList"
            >
              查看店家
            </button>
            <button
              class="storeList__heroBtn storeList__heroBtn--ghost"
              type="button"
              @click="goCooperation"
            >
              店家合作
            </button>
          </div>
        </div>

        <aside class="storeList__heroPanel">
          <div class="storeList__searchCard">
            <div class="storeList__searchHead">
              <p class="storeList__searchTitle">快速找店</p>
              <p class="storeList__searchDesc">
                輸入店名或描述，快速找到合作店家。
              </p>
            </div>

            <div class="storeList__searchBox">
              <span class="storeList__searchIcon" aria-hidden="true">
                <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
              </span>

              <input
                v-model="keyword"
                type="search"
                class="storeList__searchInput"
                placeholder="搜尋店家名稱或描述..."
                aria-label="搜尋店家"
              />

              <button
                v-if="keyword"
                class="storeList__clearBtn"
                type="button"
                aria-label="清除搜尋"
                @click="keyword = ''"
              >
                ×
              </button>
            </div>

            <div class="storeList__sortBox">
              <label class="storeList__sortLabel" for="sortType"
                >排序方式</label
              >
              <select
                id="sortType"
                v-model="sortType"
                class="storeList__sortSelect"
              >
                <option value="default">預設排序</option>
                <option value="nameAsc">店名 A-Z</option>
                <option value="nameDesc">店名 Z-A</option>
              </select>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <!-- Content -->
    <section id="store-list" class="storeList__section">
      <div class="storeList__container">
        <header class="storeList__sectionHeader">
          <div>
            <p class="storeList__sectionEyebrow">STORE LIST</p>
            <h2 class="storeList__sectionTitle">合作店家列表</h2>
            <p class="storeList__sectionDesc">
              共 {{ pageInfo.total }} 家店家
              <template v-if="keyword">
                ，目前找到 {{ filteredStores.length }} 家符合「{{ keyword }}」
              </template>
            </p>
          </div>

          <button
            v-if="keyword"
            class="storeList__resetBtn"
            type="button"
            @click="keyword = ''"
          >
            清除搜尋
          </button>
        </header>

        <!-- Summary -->
        <div class="storeList__summary">
          <div class="storeList__summaryItem">
            <p class="storeList__summaryNum">{{ pageInfo.total }}</p>
            <p class="storeList__summaryLabel">合作店家</p>
          </div>

          <div class="storeList__summaryItem">
            <p class="storeList__summaryNum">{{ sortedStores.length }}</p>
            <p class="storeList__summaryLabel">目前顯示</p>
          </div>

          <div class="storeList__summaryItem">
            <p class="storeList__summaryNum">{{ pageInfo.page }}</p>
            <p class="storeList__summaryLabel">目前頁數</p>
          </div>

          <div class="storeList__summaryItem">
            <p class="storeList__summaryNum">{{ pageInfo.totalPages }}</p>
            <p class="storeList__summaryLabel">總頁數</p>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="storeList__grid">
          <article v-for="n in 6" :key="n" class="storeList__skeleton">
            <div class="storeList__skeletonLogo"></div>
            <div
              class="storeList__skeletonLine storeList__skeletonLine--lg"
            ></div>
            <div class="storeList__skeletonLine"></div>
            <div
              class="storeList__skeletonLine storeList__skeletonLine--sm"
            ></div>
          </article>
        </div>

        <!-- Empty -->
        <div v-else-if="sortedStores.length === 0" class="storeList__empty">
          <div class="storeList__emptyIcon" aria-hidden="true">
            <font-awesome-icon :icon="['fas', 'store-slash']" />
          </div>
          <p class="storeList__emptyTitle">
            {{ keyword ? `找不到「${keyword}」相關店家` : '目前沒有合作店家' }}
          </p>
          <p class="storeList__emptyDesc">
            你可以換個關鍵字搜尋，或稍後再回來看看最新合作店家。
          </p>
          <button
            v-if="keyword"
            class="storeList__emptyBtn"
            type="button"
            @click="keyword = ''"
          >
            清除搜尋
          </button>
        </div>

        <!-- Store Cards -->
        <div v-else class="storeList__grid">
          <article
            v-for="store in sortedStores"
            :key="store.id"
            class="storeList__card"
            @click="goToStore(store)"
          >
            <div class="storeList__cardTop">
              <div class="storeList__logoWrap">
                <img
                  v-if="store.logoUrl"
                  class="storeList__logo"
                  :src="store.logoUrl"
                  :alt="store.storeName"
                  loading="lazy"
                />
                <div v-else class="storeList__logoFallback">
                  {{ getStoreInitial(store.storeName) }}
                </div>
              </div>

              <span class="storeList__tag">
                <font-awesome-icon :icon="['fas', 'star']" />
                合作店家
              </span>
            </div>

            <div class="storeList__cardBody">
              <h3 class="storeList__cardTitle">{{ store.storeName }}</h3>
              <p class="storeList__cardDesc">
                {{ store.shortDescription || '店家目前尚未提供簡介。' }}
              </p>
            </div>

            <div class="storeList__cardFooter">
              <span class="storeList__cardHint">查看店家資訊</span>
              <span class="storeList__arrow" aria-hidden="true">
                <font-awesome-icon :icon="['fas', 'arrow-right']" />
              </span>
            </div>
          </article>
        </div>

        <!-- Newsletter -->
        <section class="storeList__newsletter">
          <div class="storeList__newsletterLeft">
            <p class="storeList__newsletterBadge">NEWSLETTER</p>
            <h2 class="storeList__newsletterTitle">訂閱電子報</h2>
            <p class="storeList__newsletterDesc">
              別錯過第一手店家消息、活動公告、抽獎上架與限定優惠。
            </p>
          </div>

          <form
            class="storeList__newsletterForm"
            @submit.prevent="submitNewsletter"
          >
            <div class="storeList__newsletterInputWrap">
              <span class="storeList__newsletterIcon" aria-hidden="true">
                <font-awesome-icon :icon="['fas', 'envelope']" />
              </span>
              <input
                v-model="newsletterEmail"
                type="email"
                class="storeList__newsletterInput"
                placeholder="請輸入 Email"
                aria-label="電子信箱"
              />
            </div>

            <button class="storeList__newsletterBtn" type="submit">
              立即訂閱
            </button>

            <p v-if="newsletterMessage" class="storeList__newsletterMessage">
              {{ newsletterMessage }}
            </p>
          </form>
        </section>

        <!-- CTA -->
        <section class="storeList__cta">
          <div>
            <p class="storeList__ctaTitle">你也是店家嗎？</p>
            <p class="storeList__ctaDesc">
              歡迎加入 STARDO 合作行列，讓更多玩家看見你的店。
            </p>
          </div>

          <button
            class="storeList__ctaBtn"
            type="button"
            @click="goCooperation"
          >
            立即洽談合作
          </button>
        </section>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { getStores } from '@/services/storeService';
import { executeApi } from '@/utils/executeApiUtils';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

type StoreItem = {
  id: string;
  storeName: string;
  shortDescription?: string | null;
  logoUrl?: string | null;
};

type StorePageResponse = {
  page?: number;
  size?: number;
  total?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
  data?: StoreItem[];
};

type SortType = 'default' | 'nameAsc' | 'nameDesc';

const router = useRouter();

const stores = ref<StoreItem[]>([]);
const loading = ref(false);
const keyword = ref('');
const sortType = ref<SortType>('default');
const newsletterEmail = ref('');
const newsletterMessage = ref('');

const pageInfo = ref({
  page: 1,
  size: 100,
  total: 0,
  totalPages: 1,
  hasNext: false,
  hasPrevious: false,
});

const filteredStores = computed(() => {
  const q = keyword.value.trim().toLowerCase();

  if (!q) return stores.value;

  return stores.value.filter((store) => {
    const name = String(store.storeName || '').toLowerCase();
    const desc = String(store.shortDescription || '').toLowerCase();

    return name.includes(q) || desc.includes(q);
  });
});

const sortedStores = computed(() => {
  const list = [...filteredStores.value];

  if (sortType.value === 'nameAsc') {
    return list.sort((a, b) =>
      a.storeName.localeCompare(b.storeName, 'zh-Hant'),
    );
  }

  if (sortType.value === 'nameDesc') {
    return list.sort((a, b) =>
      b.storeName.localeCompare(a.storeName, 'zh-Hant'),
    );
  }

  return list;
});

const normalizeStores = (res: StorePageResponse | StoreItem[] | any) => {
  const pageData: StorePageResponse = Array.isArray(res)
    ? {
        page: 1,
        size: res.length,
        total: res.length,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
        data: res,
      }
    : res;

  stores.value = Array.isArray(pageData?.data) ? pageData.data : [];

  pageInfo.value = {
    page: Number(pageData?.page ?? 1),
    size: Number(pageData?.size ?? stores.value.length),
    total: Number(pageData?.total ?? stores.value.length),
    totalPages: Number(pageData?.totalPages ?? 1),
    hasNext: Boolean(pageData?.hasNext),
    hasPrevious: Boolean(pageData?.hasPrevious),
  };
};

const fetchStores = async () => {
  loading.value = true;

  await executeApi<StorePageResponse>({
    fn: getStores,
    onSuccess: (data) => {
      normalizeStores(data);
    },
    onFinally: () => {
      loading.value = false;
    },
  });
};

const getStoreInitial = (name?: string) => {
  const text = String(name || 'S').trim();
  return text.slice(0, 1).toUpperCase();
};

const goToStore = (store: StoreItem) => {
  router.push({ name: 'StoreDetail', params: { id: store.id } });
};

const goCooperation = () => {
  router.push({ name: 'Cooperation' });
};

const scrollToList = () => {
  document.getElementById('store-list')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
};

const submitNewsletter = () => {
  const email = newsletterEmail.value.trim();

  if (!email) {
    newsletterMessage.value = '請先輸入 Email。';
    return;
  }

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!isValidEmail) {
    newsletterMessage.value = 'Email 格式看起來不太對喔。';
    return;
  }

  newsletterMessage.value = '訂閱成功！之後有新消息會第一時間通知你。';
  newsletterEmail.value = '';
};

onMounted(() => {
  fetchStores();
});
</script>

<style scoped lang="scss">
.storeList {
  min-height: 100vh;
  background: linear-gradient(180deg, #f4e1cc 0%, #f8efe3 42%, #ffffff 100%);
  position: relative;
  z-index: 9;

  &__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }

  /* Hero */
  &__hero {
    background:
      radial-gradient(
        circle at 20% 10%,
        rgba(229, 166, 87, 0.24),
        transparent 30%
      ),
      radial-gradient(
        circle at 85% 20%,
        rgba(180, 51, 37, 0.26),
        transparent 34%
      ),
      #000;
    color: #fff;
    padding: 38px 0 34px;
  }

  &__heroInner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;

    display: grid;
    grid-template-columns: 1.08fr 0.92fr;
    gap: 24px;
    align-items: stretch;
  }

  &__heroContent {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  &__badge,
  &__newsletterBadge,
  &__sectionEyebrow {
    display: inline-flex;
    align-items: center;
    width: fit-content;
    height: 26px;
    padding: 0 12px;
    border-radius: 999px;
    margin: 0 0 10px;

    color: rgba(229, 166, 87, 0.98);
    background: rgba(229, 166, 87, 0.12);
    border: 1px solid rgba(229, 166, 87, 0.35);

    font-size: 12px;
    letter-spacing: 2px;
    font-weight: 1000;
  }

  &__title {
    margin: 0 0 12px;
    color: #fff;
    font-size: 38px;
    line-height: 1.15;
    font-weight: 1000;
    letter-spacing: 0.5px;
  }

  &__subtitle {
    max-width: 580px;
    margin: 0;
    color: rgba(255, 255, 255, 0.82);
    font-size: 15px;
    line-height: 1.85;
  }

  &__heroActions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 22px;
  }

  &__heroBtn {
    height: 48px;
    padding: 0 20px;
    border-radius: 999px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 1000;
    letter-spacing: 1px;

    &--primary {
      background: #b43325;
      border: 1px solid #b43325;
      color: #fff;
    }

    &--ghost {
      background: transparent;
      border: 1px solid rgba(229, 166, 87, 0.65);
      color: rgba(229, 166, 87, 0.98);
    }
  }

  &__heroPanel {
    display: flex;
    justify-content: flex-end;
  }

  &__searchCard {
    width: 100%;
    max-width: 470px;
    padding: 18px;
    border-radius: 20px;

    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.1),
      rgba(255, 255, 255, 0.045)
    );
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
    backdrop-filter: blur(10px);
  }

  &__searchHead {
    margin-bottom: 14px;
  }

  &__searchTitle {
    margin: 0 0 6px;
    font-size: 17px;
    font-weight: 1000;
    letter-spacing: 1px;
  }

  &__searchDesc {
    margin: 0;
    color: rgba(255, 255, 255, 0.76);
    font-size: 13px;
    line-height: 1.7;
  }

  &__searchBox {
    position: relative;
    display: flex;
    align-items: center;
  }

  &__searchIcon {
    position: absolute;
    left: 14px;
    color: rgba(229, 166, 87, 0.98);
    font-size: 14px;
    pointer-events: none;
  }

  &__searchInput {
    width: 100%;
    height: 48px;
    padding: 0 42px 0 40px;
    border-radius: 14px;

    background: rgba(0, 0, 0, 0.38);
    border: 1px solid rgba(255, 255, 255, 0.14);
    color: #fff;
    outline: none;

    font-size: 14px;
    font-weight: 800;

    &::placeholder {
      color: rgba(255, 255, 255, 0.52);
    }

    &:focus {
      border-color: rgba(229, 166, 87, 0.7);
      box-shadow: 0 0 0 3px rgba(229, 166, 87, 0.16);
    }
  }

  &__clearBtn {
    position: absolute;
    right: 10px;
    width: 28px;
    height: 28px;
    border: 0;
    border-radius: 999px;
    cursor: pointer;

    background: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.85);

    font-size: 18px;
    line-height: 1;

    &:hover {
      background: rgba(255, 255, 255, 0.22);
      color: #fff;
    }
  }

  &__sortBox {
    display: grid;
    gap: 8px;
    margin-top: 14px;
  }

  &__sortLabel {
    color: rgba(255, 255, 255, 0.75);
    font-size: 13px;
    font-weight: 900;
  }

  &__sortSelect {
    width: 100%;
    height: 46px;
    padding: 0 14px;
    border-radius: 14px;

    background: rgba(0, 0, 0, 0.38);
    border: 1px solid rgba(255, 255, 255, 0.14);
    color: #fff;
    outline: none;

    font-size: 14px;
    font-weight: 900;
    cursor: pointer;

    option {
      color: #111;
    }

    &:focus {
      border-color: rgba(229, 166, 87, 0.7);
      box-shadow: 0 0 0 3px rgba(229, 166, 87, 0.16);
    }
  }

  /* Section */
  &__section {
    padding: 36px 0 46px;
  }

  &__sectionHeader {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 14px;
  }

  &__sectionEyebrow {
    color: rgba(178, 71, 58, 0.95);
    background: rgba(178, 71, 58, 0.08);
    border-color: rgba(178, 71, 58, 0.16);
  }

  &__sectionTitle {
    margin: 0 0 8px;
    color: #111;
    font-size: 24px;
    font-weight: 1000;
    letter-spacing: 1px;
  }

  &__sectionDesc {
    margin: 0;
    color: rgba(0, 0, 0, 0.62);
    font-size: 14px;
    line-height: 1.7;
  }

  &__resetBtn {
    height: 40px;
    padding: 0 14px;
    border-radius: 12px;
    cursor: pointer;

    background: rgba(255, 255, 255, 0.76);
    border: 1px solid rgba(0, 0, 0, 0.1);
    color: #111;

    font-size: 14px;
    font-weight: 900;
  }

  &__summary {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    margin: 14px 0 18px;
  }

  &__summaryItem {
    padding: 14px 14px 12px;
    border-radius: 18px;

    background: rgba(255, 255, 255, 0.74);
    border: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow: 0 12px 28px rgba(60, 30, 10, 0.06);
  }

  &__summaryNum {
    margin: 0 0 2px;
    color: rgba(178, 71, 58, 0.96);
    font-size: 22px;
    font-weight: 1000;
  }

  &__summaryLabel {
    margin: 0;
    color: rgba(0, 0, 0, 0.58);
    font-size: 12px;
    letter-spacing: 1px;
    font-weight: 800;
  }

  /* Cards */
  &__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }

  &__card {
    position: relative;
    overflow: hidden;
    padding: 18px;
    border-radius: 22px;
    cursor: pointer;

    background:
      linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.88),
        rgba(255, 255, 255, 0.72)
      ),
      #fff;
    border: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow: 0 14px 34px rgba(60, 30, 10, 0.08);

    transition:
      transform 0.18s ease,
      box-shadow 0.18s ease,
      border-color 0.18s ease;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      background: radial-gradient(
        circle at 18% 10%,
        rgba(229, 166, 87, 0.2),
        transparent 34%
      );
      opacity: 0;
      transition: opacity 0.18s ease;
    }

    &:hover {
      transform: translateY(-4px);
      border-color: rgba(178, 71, 58, 0.18);
      box-shadow: 0 20px 44px rgba(60, 30, 10, 0.14);

      &::before {
        opacity: 1;
      }

      .storeList__arrow {
        transform: translateX(3px);
      }
    }
  }

  &__cardTop {
    position: relative;
    z-index: 1;

    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: flex-start;
    margin-bottom: 16px;
  }

  &__logoWrap {
    width: 78px;
    height: 78px;
    border-radius: 22px;
    overflow: hidden;

    background: #efe2d3;
    border: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
  }

  &__logo {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &__logoFallback {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;

    background: linear-gradient(135deg, #b43325, #7a1a12);
    color: #fff;

    font-size: 28px;
    font-weight: 1000;
  }

  &__tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 28px;
    padding: 0 10px;
    border-radius: 999px;

    background: rgba(229, 166, 87, 0.92);
    border: 1px solid rgba(229, 166, 87, 0.92);
    color: #111;

    font-size: 12px;
    font-weight: 1000;
    letter-spacing: 0.5px;
    white-space: nowrap;
  }

  &__cardBody {
    position: relative;
    z-index: 1;
  }

  &__cardTitle {
    margin: 0 0 8px;
    color: #111;
    font-size: 18px;
    font-weight: 1000;
    line-height: 1.4;
    letter-spacing: 0.3px;
  }

  &__cardDesc {
    min-height: 48px;
    margin: 0;
    color: rgba(0, 0, 0, 0.66);
    font-size: 14px;
    line-height: 1.75;
  }

  &__cardFooter {
    position: relative;
    z-index: 1;

    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;

    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
  }

  &__cardHint {
    color: rgba(178, 71, 58, 0.96);
    font-size: 13px;
    font-weight: 1000;
    letter-spacing: 0.5px;
  }

  &__arrow {
    width: 34px;
    height: 34px;
    border-radius: 12px;
    display: grid;
    place-items: center;

    background: rgba(178, 71, 58, 0.08);
    color: rgba(178, 71, 58, 0.96);

    transition: transform 0.18s ease;
  }

  /* Skeleton */
  &__skeleton {
    min-height: 260px;
    padding: 18px;
    border-radius: 22px;

    background: rgba(255, 255, 255, 0.74);
    border: 1px solid rgba(0, 0, 0, 0.06);
  }

  &__skeletonLogo,
  &__skeletonLine {
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
        rgba(255, 255, 255, 0.55),
        transparent
      );
      animation: shimmer 1.4s infinite;
    }
  }

  &__skeletonLogo {
    width: 78px;
    height: 78px;
    border-radius: 22px;
    margin-bottom: 18px;
  }

  &__skeletonLine {
    height: 14px;
    border-radius: 999px;
    margin-top: 12px;

    &--lg {
      width: 72%;
      height: 18px;
    }

    &--sm {
      width: 46%;
    }
  }

  /* Empty */
  &__empty {
    padding: 34px 20px;
    border-radius: 22px;
    text-align: center;

    background: rgba(255, 255, 255, 0.76);
    border: 1px solid rgba(0, 0, 0, 0.06);
  }

  &__emptyIcon {
    width: 58px;
    height: 58px;
    margin: 0 auto 12px;
    border-radius: 18px;

    display: grid;
    place-items: center;

    background: rgba(178, 71, 58, 0.08);
    border: 1px solid rgba(178, 71, 58, 0.14);
    color: rgba(178, 71, 58, 0.96);
    font-size: 20px;
  }

  &__emptyTitle {
    margin: 0 0 6px;
    color: #111;
    font-size: 18px;
    font-weight: 1000;
  }

  &__emptyDesc {
    margin: 0 0 16px;
    color: rgba(0, 0, 0, 0.62);
    font-size: 14px;
    line-height: 1.7;
  }

  &__emptyBtn {
    height: 42px;
    padding: 0 16px;
    border-radius: 12px;
    border: 0;
    cursor: pointer;

    background: #b43325;
    color: #fff;

    font-size: 14px;
    font-weight: 1000;
  }

  /* Newsletter */
  &__newsletter {
    margin-top: 22px;
    padding: 22px;
    border-radius: 24px;

    background:
      linear-gradient(135deg, rgba(0, 0, 0, 0.92), rgba(42, 22, 16, 0.95)), #000;
    color: #fff;

    display: grid;
    grid-template-columns: 1fr 420px;
    gap: 20px;
    align-items: center;

    box-shadow: 0 18px 42px rgba(0, 0, 0, 0.18);
  }

  &__newsletterBadge {
    margin-bottom: 8px;
  }

  &__newsletterTitle {
    margin: 0 0 8px;
    font-size: 24px;
    font-weight: 1000;
    letter-spacing: 0.5px;
  }

  &__newsletterDesc {
    margin: 0;
    max-width: 560px;
    color: rgba(255, 255, 255, 0.78);
    font-size: 14px;
    line-height: 1.8;
  }

  &__newsletterForm {
    display: grid;
    gap: 10px;
  }

  &__newsletterInputWrap {
    position: relative;
    display: flex;
    align-items: center;
  }

  &__newsletterIcon {
    position: absolute;
    left: 14px;
    color: rgba(229, 166, 87, 0.98);
    pointer-events: none;
  }

  &__newsletterInput {
    width: 100%;
    height: 48px;
    padding: 0 14px 0 40px;
    border-radius: 14px;

    background: rgba(255, 255, 255, 0.09);
    border: 1px solid rgba(255, 255, 255, 0.14);
    color: #fff;
    outline: none;

    font-size: 14px;
    font-weight: 800;

    &::placeholder {
      color: rgba(255, 255, 255, 0.52);
    }

    &:focus {
      border-color: rgba(229, 166, 87, 0.68);
      box-shadow: 0 0 0 3px rgba(229, 166, 87, 0.14);
    }
  }

  &__newsletterBtn {
    height: 46px;
    border-radius: 14px;
    border: 0;
    cursor: pointer;

    background: rgba(229, 166, 87, 0.96);
    color: #111;

    font-size: 14px;
    font-weight: 1000;
    letter-spacing: 1px;
  }

  &__newsletterMessage {
    margin: 0;
    color: rgba(255, 255, 255, 0.78);
    font-size: 13px;
    line-height: 1.6;
  }

  /* CTA */
  &__cta {
    margin-top: 18px;
    padding: 18px;
    border-radius: 22px;

    background: linear-gradient(135deg, #b43325, #7a1a12);
    color: #fff;

    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: center;
    flex-wrap: wrap;
  }

  &__ctaTitle {
    margin: 0 0 4px;
    font-size: 19px;
    font-weight: 1000;
  }

  &__ctaDesc {
    margin: 0;
    color: rgba(255, 255, 255, 0.84);
    font-size: 14px;
    line-height: 1.7;
  }

  &__ctaBtn {
    height: 44px;
    padding: 0 18px;
    border-radius: 999px;
    cursor: pointer;

    background: rgba(229, 166, 87, 0.96);
    border: 1px solid rgba(229, 166, 87, 0.96);
    color: #111;

    font-size: 14px;
    font-weight: 1000;
    letter-spacing: 1px;
  }

  @media (max-width: 1024px) {
    &__heroInner {
      grid-template-columns: 1fr;
    }

    &__heroPanel {
      justify-content: flex-start;
    }

    &__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    &__summary {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    &__newsletter {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 720px) {
    &__container,
    &__heroInner {
      padding: 0 16px;
    }

    &__hero {
      padding: 30px 0 26px;
    }

    &__title {
      font-size: 30px;
    }

    &__sectionHeader {
      flex-direction: column;
      align-items: stretch;
    }

    &__grid {
      grid-template-columns: 1fr;
    }

    &__summary {
      grid-template-columns: 1fr;
    }

    &__heroActions {
      flex-direction: column;
    }

    &__heroBtn,
    &__ctaBtn,
    &__newsletterBtn {
      width: 100%;
    }

    &__cta {
      align-items: stretch;
    }
  }
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
