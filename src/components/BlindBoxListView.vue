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
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import IchibanKujiCard from '@/components/IchibanKujiCard.vue';
import MSelect from '@/components/common/MSelect.vue';
import MSearch from '@/components/common/MSearch.vue';
import BasePagination from '@/components/common/BasePagination.vue';

import blindboxbg from '@/assets/image/blindboxbg.png';

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
  { label: '開抽中', value: 'open' },
  { label: '已結束', value: 'close' },
];

const filterSeries = ref('');
const filterStatus = ref('');
const keyword = ref('');

const list: KujiItem[] = [
  {
    id: 'kuji-001',
    bannerSrc: '/images/kuji-banner.png',
    title:
      '一番賞 哥吉拉 MACHINE CHRONICLE 抽先公開！收錄23公分 SOFVICS 機械哥吉拉軟膠',
    remaining: 100,
    remainingUnit: '抽',
    prices: [
      { label: '金幣', amount: 250, unit: '抽' },
      { label: '銀幣', amount: 1250, unit: '抽' },
    ],
    timeText: '一週前',
    tagText: '動感光波',
    series: 'gundam',
    status: 'open',
  },
  ...Array.from({ length: 11 }).map((_, i) => ({
    id: `kuji-${i + 2}`.padStart(7, '0'),
    bannerSrc: '/images/kuji-banner.png',
    title:
      '一番賞 哥吉拉 MACHINE CHRONICLE 抽先公開！收錄23公分 SOFVICS 機械哥吉拉軟膠',
    remaining: 100 - i * 3,
    remainingUnit: '抽',
    prices: [
      { label: '金幣', amount: 250, unit: '抽' },
      { label: '銀幣', amount: 1250, unit: '抽' },
    ],
    timeText: '一週前',
    tagText: '動感光波',
    series: i % 2 === 0 ? 'gundam' : 'op',
    status: i % 3 === 0 ? 'open' : 'close',
  })),
];

const filteredList = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  return list.filter((x) => {
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
};

const goDetail = (id: string) => {
  console.log('go detail:', id);
};

watch([filterSeries, filterStatus], () => {
  page.value = 1;
});

/* ✅ 防呆：篩完後總頁數變小，避免 page 超出 */
watch(totalPages, (tp) => {
  if (page.value > tp) page.value = tp;
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
