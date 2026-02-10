<!-- src/views/StoreLotteries.vue -->
<template>
  <div class="storeLotteries">
    <div class="storeLotteries__bg" aria-hidden="true">
      <img :src="blindboxbg" alt="" class="storeLotteries__bgImg" />
    </div>

    <div class="storeLotteries__container">
      <header class="storeLotteries__header">
        <!-- 麵包屑 -->
        <nav class="storeLotteries__breadcrumb">
          <span class="clickable" @click="$router.push({ name: 'Home' })">首頁</span>
          <span> / </span>
          <span class="storeLotteries__breadcrumb-current">{{ storeName }}</span>
        </nav>
        
        <h2 class="storeLotteries__title">{{ storeName }}</h2>
        <p class="storeLotteries__subtitle" v-if="storeInfo?.description">
          {{ storeInfo.description }}
        </p>

        <div class="storeLotteries__filters">
          <div class="storeLotteries__selects">
            <MSelect
              v-model="filterCategory"
              :options="categoryOptions"
              placeholder="全部類型"
              placeholder-value=""
              class="storeLotteries__selectItem"
            />
            <MSelect
              v-model="filterStatus"
              :options="statusOptions"
              placeholder="全部狀態"
              placeholder-value=""
              class="storeLotteries__selectItem"
            />
          </div>

          <MSearch
            v-model="keyword"
            placeholder="搜尋商品"
            class="storeLotteries__searchItem"
            @search="onSearch"
          >
            <template #icon>
              <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
            </template>
          </MSearch>
        </div>
      </header>

      <!-- Loading / Error -->
      <div v-if="loading" class="storeLotteries__loading">載入中...</div>
      <div v-else-if="errorMsg" class="storeLotteries__error">{{ errorMsg }}</div>
      <div v-else-if="filteredList.length === 0" class="storeLotteries__empty">
        <font-awesome-icon :icon="['fas', 'box-open']" class="storeLotteries__emptyIcon" />
        <p>目前沒有商品</p>
      </div>

      <template v-else>
        <section class="storeLotteries__grid">
          <IchibanKujiCard
            v-for="item in pagedList"
            :key="item.id"
            class="storeLotteries__card"
            :item="item"
            @click="goDetail(item.id)"
          />
        </section>

        <div class="storeLotteries__pagination">
          <BasePagination
            v-model:page="page"
            :total-pages="totalPages"
            :max-visible="5"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import IchibanKujiCard from '@/components/IchibanKujiCard.vue';
import MSelect from '@/components/common/MSelect.vue';
import MSearch from '@/components/common/MSearch.vue';
import BasePagination from '@/components/common/BasePagination.vue';

import blindboxbg from '@/assets/image/blindboxbg.png';
import demo1 from '@/assets/image/demo1.jpg';

import { getBrowseLotteriesByStore } from '@/services/lotteryBrowseService';

const route = useRoute();
const router = useRouter();

const storeId = computed(() => String(route.params.storeId || ''));
const storeName = computed(() => {
  // 從路由 query 或 state 取得店家名稱
  return String(route.query.name || storeInfo.value?.storeName || '店家商品');
});

type PriceItem = { label: string; amount: number; unit: string };
type KujiItem = {
  id: string;
  bannerSrc: string;
  title: string;
  remaining: number;
  remainingUnit: string;
  prices: PriceItem[];
  timeText: string;
  tagText: string;
  category?: string;
  status?: string;
};

const categoryOptions = [
  { label: '官方一番賞', value: 'OFFICIAL_ICHIBAN' },
  { label: '自製賞', value: 'CUSTOM_GACHA' },
  { label: '扭蛋', value: 'PRIZE_CAPSULE' },
  { label: '刮刮樂', value: 'SCRATCH_CARD' },
  { label: '卡牌抽選', value: 'CARD_DRAW' },
];

const statusOptions = [
  { label: '開抽中', value: 'ON_SHELF' },
  { label: '已結束', value: 'SOLD_OUT' },
];

const filterCategory = ref('');
const filterStatus = ref('');
const keyword = ref('');

const loading = ref(false);
const errorMsg = ref('');
const list = ref<KujiItem[]>([]);
const storeInfo = ref<any>(null);

const formatDate = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 1) return '今天';
  if (days < 7) return `${days}天前`;
  if (days < 30) return `${Math.floor(days / 7)}週前`;
  return `${Math.floor(days / 30)}個月前`;
};

const toKujiItem = (x: any): KujiItem => {
  const data = x?.lottery ?? x;

  const id = String(data?.id ?? '');
  const title = String(data?.title ?? '未命名商品');
  const bannerSrc = String(data?.mainImageUrl ?? data?.imageUrl ?? '') || demo1;
  const remaining = Number(data?.remainingDraws ?? data?.remainingPrizes ?? 0);
  const maxDraws = Number(data?.maxDraws ?? 0);
  const currentPrice = Number(data?.currentPrice ?? data?.pricePerDraw ?? 0);

  let categoryLabel = '';
  switch (data?.category) {
    case 'OFFICIAL_ICHIBAN': categoryLabel = '一番賞'; break;
    case 'CUSTOM_GACHA': categoryLabel = '自製賞'; break;
    case 'PRIZE_CAPSULE': categoryLabel = '扭蛋'; break;
    case 'SCRATCH_CARD': categoryLabel = '刮刮樂'; break;
    case 'CARD_DRAW': categoryLabel = '卡牌抽選'; break;
    default: categoryLabel = data?.categoryName || '其他';
  }

  return {
    id,
    bannerSrc,
    title,
    remaining,
    remainingUnit: `/ ${maxDraws} 抽`,
    prices: [
      { label: '每抽', amount: currentPrice, unit: '元' },
      { label: '10連', amount: currentPrice * 10, unit: '元' },
    ],
    timeText: formatDate(data?.createdAt),
    tagText: categoryLabel,
    category: data?.category,
    status: data?.status,
  };
};

const loadLotteries = async () => {
  if (!storeId.value) return;
  
  loading.value = true;
  errorMsg.value = '';

  try {
    const res = await getBrowseLotteriesByStore(storeId.value);
    if (res.success && Array.isArray(res.data)) {
      list.value = res.data.map(toKujiItem);
    } else if (res.success && res.data) {
      // 可能回傳 { lotteries: [...], store: {...} }
      if (Array.isArray(res.data.lotteries)) {
        list.value = res.data.lotteries.map(toKujiItem);
      }
      if (res.data.store) {
        storeInfo.value = res.data.store;
      }
    } else {
      errorMsg.value = res.message || '無法載入商品';
    }
  } catch (e) {
    console.error('StoreLotteries - loadLotteries error:', e);
    errorMsg.value = '載入失敗，請稍後再試';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadLotteries();
});

watch(storeId, () => {
  loadLotteries();
});

const filteredList = computed(() => {
  const kw = keyword.value.toLowerCase();
  return list.value.filter((item) => {
    const okCategory = filterCategory.value ? item.category === filterCategory.value : true;
    const okStatus = filterStatus.value ? item.status === filterStatus.value : true;
    const okKw = kw ? item.title.toLowerCase().includes(kw) : true;
    return okCategory && okStatus && okKw;
  });
});

const pageSize = 12;
const page = ref(1);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredList.value.length / pageSize))
);

const pagedList = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredList.value.slice(start, start + pageSize);
});

watch([filterCategory, filterStatus, keyword], () => {
  page.value = 1;
});

const onSearch = () => {
  page.value = 1;
};

const goDetail = (id: string) => {
  router.push({ name: 'IchibanDetail', params: { id } });
};
</script>

<style scoped lang="scss">
.storeLotteries {
  position: relative;
  min-height: 100vh;
  background: #fdf6ef;

  &__bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
  }

  &__bgImg {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.25;
  }

  &__container {
    position: relative;
    z-index: 1;
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px 16px 60px;
  }

  &__header {
    margin-bottom: 24px;
  }
  
  &__breadcrumb {
    font-size: 13px;
    color: #7b6a5a;
    margin-bottom: 8px;
    
    .clickable {
      cursor: pointer;
      &:hover {
        text-decoration: underline;
      }
    }

    &-current {
      color: #3f2412;
      font-weight: 600;
    }
  }

  &__title {
    font-size: 28px;
    font-weight: 800;
    color: #3f2412;
    margin-bottom: 8px;
  }
  
  &__subtitle {
    font-size: 14px;
    color: #6b5a4a;
    margin-bottom: 16px;
  }

  &__filters {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    margin-top: 16px;
  }

  &__selects {
    display: flex;
    gap: 12px;
  }

  &__selectItem {
    min-width: 140px;
  }

  &__searchItem {
    flex: 1;
    min-width: 200px;
    max-width: 320px;
  }

  &__loading,
  &__error,
  &__empty {
    text-align: center;
    padding: 60px 20px;
    color: #888;
    font-size: 16px;
  }
  
  &__emptyIcon {
    font-size: 48px;
    color: #ccc;
    margin-bottom: 16px;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 24px;
  }

  &__card {
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }
  }

  &__pagination {
    margin-top: 32px;
    display: flex;
    justify-content: center;
  }
}
</style>
