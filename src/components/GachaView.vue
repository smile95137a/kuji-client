<!-- src/components/GachaView.vue -->
<template>
  <div class="gacha">
    <div class="gacha__bg" aria-hidden="true">
      <img :src="gachaBg" alt="" class="gacha__bgImg" />
    </div>

    <div class="gacha__container">
      <header class="gacha__header">
        <h2 class="gacha__title">扭蛋</h2>

        <div class="gacha__filters">
          <div class="gacha__selects">
            <MSelect
              v-model="filterTheme"
              :options="themeOptions"
              placeholder="全部系列"
              placeholder-value=""
              class="gacha__selectItem"
            />
            <MSelect
              v-model="filterStatus"
              :options="statusOptions"
              placeholder="全部狀態"
              placeholder-value=""
              class="gacha__selectItem"
            />
          </div>

          <MSearch
            v-model="keyword"
            placeholder="搜尋"
            class="gacha__searchItem"
            @search="onSearch"
          >
            <template #icon>
              <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
            </template>
          </MSearch>
        </div>
      </header>

      <!--  固定內容高度，避免空資料造成跳動 -->
      <div class="gacha__content">
        <!-- 空資料狀態（用佔位高度，不會跑版） -->
        <div v-if="loading" class="gacha__state">載入中...</div>
        <div v-else-if="kujiList.length === 0" class="gacha__state">
          目前沒有商品
        </div>

        <!-- 列表 -->
        <section v-else class="gacha__grid">
          <IchibanKujiCard
            v-for="item in kujiList"
            :key="item.id"
            class="ichibanList__card"
            :item="item"
            @click="goDetail(item.id)"
          />
        </section>
      </div>

      <!--  分頁永遠保留空間，避免跳動 -->
      <div
        class="gacha__pagination"
        :class="{ 'is-hidden': kujiList.length === 0 }"
      >
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
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import IchibanKujiCard from '@/components/IchibanKujiCard.vue';
import MSelect from '@/components/common/MSelect.vue';
import MSearch from '@/components/common/MSearch.vue';
import BasePagination from '@/components/common/BasePagination.vue';

import {
  queryBrowseLotteries,
  type BrowseCondition,
} from '@/services/lotteryBrowseService';
import { queryThemes, type CategoryRes } from '@/services/categoryService';
import { executeApi } from '@/utils/executeApiUtils';
import { useServerPagination } from '@/composables/useServerPagination';
import gachaBg from '@/assets/image/blindboxbg.png';

type GachaItem = {
  id: string;
  imageUrl: string;
  title: string;
  theme?: string;
  status?: string;
  tags?: string[];

  storeName?: string;
  currentPrice?: number;
  remainingDraws?: number;
};

const themeOptions = ref<Array<{ label: string; value: string }>>([]);

const statusOptions = [
  { label: '已上架', value: 'ON_SHELF' },
  { label: '未上架', value: 'OFF_SHELF' },
];

const filterTheme = ref('');
const filterStatus = ref('');
const keyword = ref('');
const loading = ref(true);

const router = useRouter();

const { page, size, total, totalPages, hasNext, hasPrevious, sync } =
  useServerPagination(6);
const kujiList = ref<GachaItem[]>([]);

const onSearch = () => {
  page.value = 1;
  fetchList();
};

const goToPage = () => {
  fetchList();
};

const goDetail = (id: string) => {
  router.push({ name: 'IchibanDetail', params: { id } });
};

const loadThemeOptions = async () => {
  await executeApi({
    fn: () => queryThemes(),
    showCatchDialog: false,
    showFailDialog: false,
    onSuccess: (res: any) => {
      const list: CategoryRes[] = Array.isArray(res) ? res : (res?.data ?? []);
      const sorted = [...list].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
      const seen = new Set<string>();
      themeOptions.value = sorted
        .map((item) => String(item?.name ?? '').trim())
        .filter((name) => name && !seen.has(name) && seen.add(name) as unknown as boolean)
        .map((value) => ({ label: value, value }));
    },
  });
};

const fetchList = async () => {
  loading.value = true;
  const condition: BrowseCondition = {
    category: 'GACHA',
    theme: filterTheme.value || undefined,
    status: (filterStatus.value || undefined) as any,
    keyword: keyword.value.trim() || undefined,
  };

  await executeApi({
    fn: () =>
      queryBrowseLotteries({
        condition,
        page: page.value,
        size: size.value,
      }),
    onSuccess: (result) => {
      const arr = result?.data ?? [];
      kujiList.value = arr.map((x: any) => ({
        ...x.lottery,
        prizes: x.prizes,
      }));
      sync(result);
    },
    onFinally: () => {
      loading.value = false;
    },
  });
};

watch([filterTheme, filterStatus], () => {
  page.value = 1;
  fetchList();
});

onMounted(async () => {
  await loadThemeOptions();
  await fetchList();
});
</script>

<style scoped lang="scss">
/* src/components/GachaView.vue (scoped) */

.gacha {
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

  &__selectItem {
    /* 需要的話可加寬度 */
  }

  &__searchItem {
    /* 需要的話可加寬度 */
  }

  &__content {
    min-height: 740px;

    display: flex;
    flex-direction: column;
  }

  &__state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;

    padding: 28px 0;
    text-align: center;
    font-weight: 900;
    color: rgba(0, 0, 0, 0.55);
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

  /*  分頁保留高度，避免有/無分頁時版面跳動 */
  &__pagination {
    margin-top: 26px;
    display: flex;
    justify-content: center;

    min-height: 44px;
  }

  &__pagination.is-hidden {
    visibility: hidden;
    pointer-events: none;
  }
}

@media (max-width: 1024px) {
  .gacha {
    &__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    /* 平板卡片通常更高，內容區加大 */
    &__content {
      min-height: 860px;
    }
  }
}

@media (max-width: 640px) {
  .gacha {
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

    /* 手機卡片更高，內容區再加大 */
    &__content {
      min-height: 980px;
    }
  }
}
</style>
