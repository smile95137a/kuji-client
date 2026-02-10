<!-- src/views/GachaList.vue - 扭蛋專區頁面 -->
<template>
  <div class="gachaList">
    <div class="gachaList__bg" aria-hidden="true">
      <div class="gachaList__bgGradient"></div>
    </div>

    <div class="gachaList__container">
      <header class="gachaList__header">
        <h1 class="gachaList__title">
          <font-awesome-icon :icon="['fas', 'circle']" class="gachaList__titleIcon" />
          扭蛋專區
        </h1>
        <p class="gachaList__subtitle">轉動扭蛋機，獲得驚喜好禮！</p>
      </header>

      <!-- 篩選區 -->
      <div class="gachaList__filters">
        <div class="gachaList__selects">
          <MSelect
            v-model="filterStatus"
            :options="statusOptions"
            placeholder="全部狀態"
            placeholder-value=""
            class="gachaList__selectItem"
          />
          <MSelect
            v-model="filterPrice"
            :options="priceOptions"
            placeholder="價格區間"
            placeholder-value=""
            class="gachaList__selectItem"
          />
        </div>

        <MSearch
          v-model="keyword"
          placeholder="搜尋扭蛋名稱"
          class="gachaList__searchItem"
          @search="onSearch"
        >
          <template #icon>
            <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
          </template>
        </MSearch>
      </div>

      <!-- Loading / Error -->
      <div v-if="loading" class="gachaList__loading">
        <div class="gachaList__spinner"></div>
        <p>載入中...</p>
      </div>

      <div v-else-if="errorMsg" class="gachaList__error">
        <font-awesome-icon :icon="['fas', 'exclamation-triangle']" />
        <p>{{ errorMsg }}</p>
        <button class="gachaList__btn" @click="loadData">重試</button>
      </div>

      <div v-else-if="filteredList.length === 0" class="gachaList__empty">
        <font-awesome-icon :icon="['fas', 'circle']" class="gachaList__emptyIcon" />
        <p>目前沒有扭蛋商品</p>
      </div>

      <!-- 扭蛋列表 -->
      <template v-else>
        <section class="gachaList__grid">
          <div
            v-for="item in pagedList"
            :key="item.id"
            class="gachaList__card"
            @click="goDetail(item.id)"
          >
            <div class="gachaList__cardImage">
              <img :src="item.imageUrl" :alt="item.title" />
              <div class="gachaList__cardBadge">
                <span>{{ item.remaining }}/{{ item.total }}</span>
              </div>
            </div>
            <div class="gachaList__cardBody">
              <h3 class="gachaList__cardTitle">{{ item.title }}</h3>
              <div class="gachaList__cardMeta">
                <span class="gachaList__cardPrice">
                  NT$ {{ item.price }}/抽
                </span>
                <span class="gachaList__cardStore">{{ item.storeName }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 分頁 -->
        <div class="gachaList__pagination">
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

interface GachaItem {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
  remaining: number;
  total: number;
  storeName: string;
  status: string;
}

const statusOptions = [
  { label: '開抽中', value: 'ON_SHELF' },
  { label: '已售罄', value: 'SOLD_OUT' },
];

const priceOptions = [
  { label: '100 以下', value: '0-100' },
  { label: '100-200', value: '100-200' },
  { label: '200-500', value: '200-500' },
  { label: '500 以上', value: '500-' },
];

const filterStatus = ref('');
const filterPrice = ref('');
const keyword = ref('');
const page = ref(1);
const pageSize = 12;

const loading = ref(false);
const errorMsg = ref('');
const list = ref<GachaItem[]>([]);

const mapItem = (x: any): GachaItem => {
  const data = x?.lottery ?? x;
  return {
    id: String(data?.id ?? ''),
    title: String(data?.title ?? '未命名扭蛋'),
    imageUrl: data?.mainImageUrl || data?.imageUrl || demo1,
    price: Number(data?.currentPrice ?? data?.pricePerDraw ?? 0),
    remaining: Number(data?.remainingDraws ?? 0),
    total: Number(data?.totalDraws ?? data?.maxDraws ?? 0),
    storeName: data?.storeName || '官方',
    status: data?.status || 'ON_SHELF',
  };
};

const loadData = async () => {
  loading.value = true;
  errorMsg.value = '';
  try {
    const res = await queryBrowseLotteries({
      condition: {
        category: 'PRIZE_CAPSULE', // 只取扭蛋類別
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
    console.error('GachaList - loadData error:', e);
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
.gachaList {
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
    background: linear-gradient(180deg, #fef3e7 0%, #fff5eb 50%, #ffffff 100%);
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
    color: #ff6b6b;
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
    border-top: 3px solid #ff6b6b;
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
    background: #ff6b6b;
    color: #fff;
    border: 0;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;

    &:hover {
      background: #e55555;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
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
    }
  }

  &__cardImage {
    position: relative;
    aspect-ratio: 4/3;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__cardBadge {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(0, 0, 0, 0.7);
    color: #fff;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
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
  }

  &__cardPrice {
    font-size: 15px;
    font-weight: 700;
    color: #ff6b6b;
  }

  &__cardStore {
    font-size: 12px;
    color: #999;
  }

  &__pagination {
    margin-top: 40px;
    display: flex;
    justify-content: center;
  }
}
</style>
