<!-- src/views/BlindboxView.vue -->
<template>
  <div class="blindbox">
    <div class="blindbox__bg" aria-hidden="true">
      <img :src="blindboxbg" alt="" class="blindbox__bgImg" />
    </div>

    <div class="blindbox__container">
      <header class="blindbox__header">
        <h2 class="blindbox__title">盲盒</h2>

        <div class="blindbox__filters">
          <div class="blindbox__selects">
            <MSelect
              v-model="filterSeries"
              :options="seriesOptions"
              placeholder="全部系列"
              placeholder-value=""
              class="blindbox__selectItem"
            />
            <MSelect
              v-model="filterStatus"
              :options="statusOptions"
              placeholder="全部狀態"
              placeholder-value=""
              class="blindbox__selectItem"
            />
          </div>

          <MSearch
            v-model="keyword"
            placeholder="搜尋"
            class="blindbox__searchItem"
            @search="onSearch"
          >
            <template #icon>
              <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
            </template>
          </MSearch>
        </div>
      </header>

      <!-- Loading / Error -->
      <div v-if="loading" class="blindbox__loading">載入中...</div>
      <div v-else-if="errorMsg" class="blindbox__error">{{ errorMsg }}</div>

      <template v-else>
        <section class="blindbox__grid">
          <IchibanKujiCard
            v-for="item in pagedList"
            :key="item.id"
            class="ichibanList__card"
            :item="item"
            @click="goDetail(item.id)"
          />
        </section>

        <div class="blindbox__pagination">
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

import IchibanKujiCard from '@/components/IchibanKujiCard.vue';
import MSelect from '@/components/common/MSelect.vue';
import MSearch from '@/components/common/MSearch.vue';
import BasePagination from '@/components/common/BasePagination.vue';

import blindboxbg from '@/assets/image/blindboxbg.png';
import demo1 from '@/assets/image/demo1.jpg';

import { queryBrowseLotteries, incrementHotCount } from '@/services/lotteryBrowseService';

const router = useRouter();

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
  series?: string;
  status?: string;
};

const seriesOptions = [
  { label: '鋼彈系列', value: 'gundam' },
  { label: '新世紀福音戰士', value: 'eva' },
  { label: '航海王', value: 'op' },
];

const statusOptions = [
  { label: '開抽中', value: 'ON_SHELF' },
  { label: '已結束', value: 'SOLD_OUT' },
];

const filterSeries = ref('');
const filterStatus = ref('');
const keyword = ref('');

const loading = ref(false);
const errorMsg = ref('');
const list = ref<KujiItem[]>([]);

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
  const data = x?.lottery ?? x; // support nested response { lottery, prizes }

  const id = String(data?.id ?? '');
  const title = String(data?.title ?? '未命名商品');
  const bannerSrc = String(data?.mainImageUrl ?? data?.imageUrl ?? '') || demo1;
  const remaining = Number(data?.remainingDraws ?? data?.remainingPrizes ?? 0);
  const maxDraws = Number(data?.maxDraws ?? 0);
  const currentPrice = Number(data?.currentPrice ?? data?.pricePerDraw ?? 0);

  // 分類標籤
  let categoryLabel = '';
  switch (data?.category) {
    case 'OFFICIAL_ICHIBAN':
      categoryLabel = '一番賞';
      break;
    case 'CUSTOM_GACHA':
      categoryLabel = '自製賞';
      break;
    case 'PRIZE_CAPSULE':
      categoryLabel = '扭蛋';
      break;
    case 'SCRATCH_CARD':
      categoryLabel = '刮刮樂';
      break;
    case 'CARD_DRAW':
      categoryLabel = '卡牌';
      break;
    default:
      categoryLabel = data?.categoryName || '商品';
  }

  return {
    id,
    bannerSrc,
    title,
    remaining: Number(remaining) || 0,
    remainingUnit: '抽',
    prices: [
      { label: '每抽', amount: currentPrice, unit: '元' },
      { label: `剩餘 ${remaining}/${maxDraws}`, amount: 0, unit: '' },
    ].filter((p) => p.label),
    timeText: formatDate(data?.createdAt ?? data?.scheduledAt),
    tagText: `${categoryLabel} | ${data?.storeName || '官方'}`,
    series: data?.subCategory || '',
    status: data?.status || 'ON_SHELF',
  };
};

const loadData = async () => {
  loading.value = true;
  errorMsg.value = '';
  try {
    const res = await queryBrowseLotteries({
      condition: {
        title: keyword.value.trim() || undefined,
        status: filterStatus.value || undefined,
      },
      sortBy: 'created_at',
      sortOrder: 'DESC',
    });
    if (res.success && Array.isArray(res.data)) {
      list.value = res.data.map(toKujiItem);
    } else {
      list.value = [];
    }
  } catch (e) {
    console.error('BlindBoxListView - loadData error:', e);
    errorMsg.value = '載入失敗，請稍後再試';
    list.value = [];
  } finally {
    loading.value = false;
  }
};

const filteredList = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  return list.value.filter((x) => {
    const okSeries = !filterSeries.value || x.series === filterSeries.value;
    const okStatus = !filterStatus.value || x.status === filterStatus.value;
    const okKw = !kw || x.title.toLowerCase().includes(kw);
    return okSeries && okStatus && okKw;
  });
});

const page = ref(1);
const pageSize = 6;

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredList.value.length / pageSize)),
);

const pagedList = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredList.value.slice(start, start + pageSize);
});

const onSearch = () => {
  page.value = 1;
  loadData();
};

const goDetail = async (id: string) => {
  try {
    // fire-and-forget increment hot count (don't block navigation)
    incrementHotCount(id).catch((err) => console.warn('incrementHotCount failed', err));
  } finally {
    router.push({ name: 'IchibanDetail', params: { id } });
  }
};

watch([filterSeries, filterStatus], () => {
  page.value = 1;
});

/* ✅ 防呆：篩完後總頁數變小，避免 page 超出 */
watch(totalPages, (tp) => {
  if (page.value > tp) page.value = tp;
});

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.blindbox {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: #fff;

  min-height: 1660px;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  &__bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    clip-path: polygon(0 10%, 100% 0, 100% 90%, 0 100%);
  }

  &__bgImg {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    object-position: 50% 50%;
    transform-origin: center;
  }

  &__container {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 1080px;
    margin: 0 auto;
    padding: 0 18px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  &__header {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-bottom: 18px;
  }

  &__title {
    margin: 0;
    font-size: 24px;
    font-weight: 900;
    color: rgba(0, 0, 0, 0.78);
  }

  &__filters {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    flex-wrap: wrap;
  }

  &__selects {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
    align-items: start;
    justify-content: center;

    :deep(.kuji-card) {
      max-width: 100%;
    }
  }

  &__pagination {
    margin-top: 26px;
    display: flex;
    justify-content: center;
  }
}

@media (max-width: 1024px) {
  .blindbox {
    &__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
}

@media (max-width: 640px) {
  .blindbox {
    min-height: 100vh;

    &__bg {
      clip-path: polygon(0 2%, 100% 0, 100% 98%, 0 100%);
    }

    &__bgImg {
      object-position: 50% 50%;
    }

    &__filters {
      display: grid;
      grid-template-columns: 1fr;
      gap: 10px;
      align-items: stretch;
    }

    &__selects {
      width: 100%;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    &__selectItem {
      width: 100%;
    }

    :deep(.m-select) {
      width: 100%;
    }

    :deep(.m-select .m-select__control) {
      width: 100%;
    }

    &__searchItem {
      width: 100%;
    }

    :deep(.m-search) {
      width: 100%;
    }

    &__grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
