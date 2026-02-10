<!-- src/views/ScratchCardList.vue - 刮刮樂專區頁面 -->
<template>
  <div class="scratchList">
    <div class="scratchList__bg" aria-hidden="true">
      <div class="scratchList__bgGradient"></div>
    </div>

    <div class="scratchList__container">
      <header class="scratchList__header">
        <h1 class="scratchList__title">
          <font-awesome-icon :icon="['fas', 'star']" class="scratchList__titleIcon" />
          刮刮樂專區
        </h1>
        <p class="scratchList__subtitle">刮開金箔，看看你的好運氣！</p>
      </header>

      <!-- 篩選區 -->
      <div class="scratchList__filters">
        <div class="scratchList__selects">
          <MSelect
            v-model="filterStatus"
            :options="statusOptions"
            placeholder="全部狀態"
            placeholder-value=""
            class="scratchList__selectItem"
          />
          <MSelect
            v-model="filterPrice"
            :options="priceOptions"
            placeholder="價格區間"
            placeholder-value=""
            class="scratchList__selectItem"
          />
        </div>

        <MSearch
          v-model="keyword"
          placeholder="搜尋刮刮樂名稱"
          class="scratchList__searchItem"
          @search="onSearch"
        >
          <template #icon>
            <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
          </template>
        </MSearch>
      </div>

      <!-- Loading / Error -->
      <div v-if="loading" class="scratchList__loading">
        <div class="scratchList__spinner"></div>
        <p>載入中...</p>
      </div>

      <div v-else-if="errorMsg" class="scratchList__error">
        <font-awesome-icon :icon="['fas', 'exclamation-triangle']" />
        <p>{{ errorMsg }}</p>
        <button class="scratchList__btn" @click="loadData">重試</button>
      </div>

      <div v-else-if="filteredList.length === 0" class="scratchList__empty">
        <font-awesome-icon :icon="['fas', 'star']" class="scratchList__emptyIcon" />
        <p>目前沒有刮刮樂商品</p>
      </div>

      <!-- 刮刮樂列表 -->
      <template v-else>
        <section class="scratchList__grid">
          <div
            v-for="item in pagedList"
            :key="item.id"
            class="scratchList__card"
            @click="goDetail(item.id)"
          >
            <div class="scratchList__cardImage">
              <img :src="item.imageUrl" :alt="item.title" />
              <div class="scratchList__cardOverlay">
                <span class="scratchList__cardHint">刮我！</span>
              </div>
              <div class="scratchList__cardBadge">
                <span>剩 {{ item.remaining }} 張</span>
              </div>
            </div>
            <div class="scratchList__cardBody">
              <h3 class="scratchList__cardTitle">{{ item.title }}</h3>
              <div class="scratchList__cardMeta">
                <span class="scratchList__cardPrice">
                  NT$ {{ item.price }}/張
                </span>
                <span class="scratchList__cardPrize" v-if="item.grandPrizeCount">
                  🏆 大獎 x{{ item.grandPrizeCount }}
                </span>
              </div>
              <p class="scratchList__cardStore">{{ item.storeName }}</p>
            </div>
          </div>
        </section>

        <!-- 分頁 -->
        <div class="scratchList__pagination">
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
import { useRouter } from 'vue-router';

import MSelect from '@/components/common/MSelect.vue';
import MSearch from '@/components/common/MSearch.vue';
import BasePagination from '@/components/common/BasePagination.vue';

import demo1 from '@/assets/image/demo1.jpg';
import { queryBrowseLotteries, incrementHotCount } from '@/services/lotteryBrowseService';

const router = useRouter();

interface ScratchItem {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
  remaining: number;
  total: number;
  storeName: string;
  status: string;
  grandPrizeCount?: number;
}

const statusOptions = [
  { label: '開抽中', value: 'ON_SHELF' },
  { label: '已售罄', value: 'SOLD_OUT' },
];

const priceOptions = [
  { label: '50 以下', value: '0-50' },
  { label: '50-100', value: '50-100' },
  { label: '100-200', value: '100-200' },
  { label: '200 以上', value: '200-' },
];

const filterStatus = ref('');
const filterPrice = ref('');
const keyword = ref('');
const page = ref(1);
const pageSize = 12;

const loading = ref(false);
const errorMsg = ref('');
const list = ref<ScratchItem[]>([]);

const mapItem = (x: any): ScratchItem => {
  const data = x?.lottery ?? x;
  return {
    id: String(data?.id ?? ''),
    title: String(data?.title ?? '未命名刮刮樂'),
    imageUrl: data?.mainImageUrl || data?.imageUrl || demo1,
    price: Number(data?.currentPrice ?? data?.pricePerDraw ?? 0),
    remaining: Number(data?.remainingDraws ?? 0),
    total: Number(data?.totalDraws ?? data?.maxDraws ?? 0),
    storeName: data?.storeName || '官方',
    status: data?.status || 'ON_SHELF',
    grandPrizeCount: data?.grandPrizeCount ?? undefined,
  };
};

const loadData = async () => {
  loading.value = true;
  errorMsg.value = '';
  try {
    const res = await queryBrowseLotteries({
      condition: {
        category: 'SCRATCH_CARD', // 只取刮刮樂類別
        title: keyword.value.trim() || undefined,
        status: filterStatus.value || undefined,
      },
      sortBy: 'created_at',
      sortOrder: 'DESC',
    });
    if (res.success && Array.isArray(res.data)) {
      list.value = res.data.map(mapItem);
    } else {
      list.value = [];
    }
  } catch (e) {
    console.error('ScratchCardList - loadData error:', e);
    errorMsg.value = '載入失敗，請稍後再試';
  } finally {
    loading.value = false;
  }
};

const filteredList = computed(() => {
  let result = list.value;

  // 價格篩選
  if (filterPrice.value) {
    const [min, max] = filterPrice.value.split('-').map(Number);
    result = result.filter((item) => {
      if (max) return item.price >= min && item.price <= max;
      return item.price >= min;
    });
  }

  return result;
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredList.value.length / pageSize))
);

const pagedList = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredList.value.slice(start, start + pageSize);
});

watch([filterStatus, filterPrice, keyword], () => {
  page.value = 1;
});

const onSearch = () => {
  page.value = 1;
  loadData();
};

const goDetail = async (id: string) => {
  incrementHotCount(id).catch((err) => console.warn('incrementHotCount failed', err));
  router.push({ name: 'IchibanDetail', params: { id } });
};

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.scratchList {
  position: relative;
  min-height: 100vh;
  padding-bottom: 80px;

  &__bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: hidden;
  }

  &__bgGradient {
    width: 100%;
    height: 100%;
    background: linear-gradient(180deg, #fff8e7 0%, #fffaf0 50%, #ffffff 100%);
  }

  &__container {
    position: relative;
    z-index: 1;
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px 24px;
  }

  &__header {
    text-align: center;
    margin-bottom: 32px;
  }

  &__title {
    font-size: 32px;
    font-weight: 900;
    color: #3f2412;
    margin: 0 0 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  &__titleIcon {
    color: #ffc107;
    font-size: 28px;
  }

  &__subtitle {
    font-size: 16px;
    color: #7b6a5a;
    margin: 0;
  }

  &__filters {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }

  &__selects {
    display: flex;
    gap: 12px;
  }

  &__selectItem {
    min-width: 140px;
  }

  &__searchItem {
    min-width: 200px;
  }

  &__loading,
  &__error,
  &__empty {
    text-align: center;
    padding: 60px 20px;
    color: #7b6a5a;
  }

  &__spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #ffc107;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  &__emptyIcon {
    font-size: 64px;
    color: #ddd;
    margin-bottom: 16px;
  }

  &__btn {
    margin-top: 16px;
    padding: 10px 24px;
    background: #ffc107;
    color: #333;
    border: 0;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;

    &:hover {
      background: #e5ac06;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
  }

  &__card {
    background: #fff;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);

      .scratchList__cardOverlay {
        opacity: 1;
      }
    }
  }

  &__cardImage {
    position: relative;
    aspect-ratio: 16/10;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__cardOverlay {
    position: absolute;
    inset: 0;
    background: rgba(255, 193, 7, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
  }

  &__cardHint {
    font-size: 24px;
    font-weight: 900;
    color: #fff;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }

  &__cardBadge {
    position: absolute;
    top: 12px;
    right: 12px;
    background: linear-gradient(135deg, #ffc107, #ff9800);
    color: #fff;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(255, 193, 7, 0.4);
  }

  &__cardBody {
    padding: 16px;
  }

  &__cardTitle {
    font-size: 16px;
    font-weight: 700;
    color: #333;
    margin: 0 0 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__cardMeta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }

  &__cardPrice {
    font-size: 15px;
    font-weight: 700;
    color: #ff9800;
  }

  &__cardPrize {
    font-size: 12px;
    color: #e65100;
    font-weight: 600;
  }

  &__cardStore {
    font-size: 12px;
    color: #999;
    margin: 0;
  }

  &__pagination {
    margin-top: 40px;
    display: flex;
    justify-content: center;
  }
}
</style>
