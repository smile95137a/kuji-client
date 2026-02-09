<!-- src/components/OfficialIchibanView.vue -->
<template>
  <div class="official-ichiban">
    <div class="official-ichiban__container">
      <header class="official-ichiban__header">
        <h2 class="official-ichiban__title">官方一番賞</h2>

        <div class="official-ichiban__filters">
          <div class="official-ichiban__selects">
            <!--  系列：改用 theme -->
            <MSelect
              v-model="filterTheme"
              :options="themeOptions"
              placeholder="全部系列"
              placeholder-value=""
              class="official-ichiban__selectItem"
            />

            <!--  狀態：改用 status -->
            <MSelect
              v-model="filterStatus"
              :options="statusOptions"
              placeholder="全部狀態"
              placeholder-value=""
              class="official-ichiban__selectItem"
            />
          </div>

          <MSearch
            v-model="keyword"
            placeholder="搜尋"
            class="official-ichiban__searchItem"
            @search="onSearch"
          >
            <template #icon>
              <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
            </template>
          </MSearch>
        </div>
      </header>

      <!-- 狀態 -->
      <div v-if="loading" class="official-ichiban__state">載入中...</div>
      <div v-else-if="errorMsg" class="official-ichiban__state is-error">
        {{ errorMsg }}
      </div>
      <div
        v-else-if="filteredList.length === 0"
        class="official-ichiban__state"
      >
        目前沒有商品
      </div>

      <!-- 列表 -->
      <section v-else class="official-ichiban__grid">
        <IchibanKujiCard
          v-for="item in pagedList"
          :key="item.id"
          class="ichibanList__card"
          :item="item"
          @click="goDetail(item.id)"
        />
      </section>

      <!-- 分頁 -->
      <div
        v-if="!loading && !errorMsg && filteredList.length > 0"
        class="official-ichiban__pagination"
      >
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
import { computed, ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import IchibanKujiCard from '@/components/IchibanKujiCard.vue';
import MSelect from '@/components/common/MSelect.vue';
import MSearch from '@/components/common/MSearch.vue';
import BasePagination from '@/components/common/BasePagination.vue';

import { queryBrowseLotteries } from '@/services/lotteryBrowseService';
import { executeApi } from '@/utils/executeApiUtils';

const router = useRouter();

/**  mapping */
const typeToCategory: Record<string, string | 'all'> = {
  kuji: 'OFFICIAL_ICHIBAN',
  gacha: 'GACHA',
  custom: 'CUSTOM_GACHA',
  card: 'TRADING_CARD',
};

//  這頁固定就是官方一番賞
const currentCategory = typeToCategory.kuji; // 'OFFICIAL_ICHIBAN'

/** filters */
const filterTheme = ref(''); //  系列改用 theme
const filterStatus = ref(''); //  狀態用 status
const keyword = ref('');

/** API data */
const loading = ref(false);
const errorMsg = ref('');
const kujiList = ref<any[]>([]);

/**  API：維持你要的 executeApi 風格 + map 成卡片要吃的 item */
const fetchList = async () => {
  loading.value = true;
  errorMsg.value = '';

  await executeApi({
    fn: () =>
      queryBrowseLotteries({
        condition: {
          category: currentCategory, //  固定只抓官方一番賞
        },
      }),
    onSuccess: async (data) => {
      const arr = Array.isArray(data) ? data : [];
      kujiList.value = arr.map((x: any) => {
        //  展平成 card 需要的 item，保留 theme/status/statusName 等欄位
        return { ...x.lottery, prizes: x.prizes };
      });
    },
    onFinal: () => {
      loading.value = false;
    },
  });
};

onMounted(async () => {
  await fetchList();
});

/**  options：動態由 API 資料長出來（系列=theme；狀態=status/statusName） */
const themeOptions = computed(() => {
  const set = new Set<string>();

  for (const item of kujiList.value as any[]) {
    const v = String(item?.theme ?? '').trim();
    if (v) set.add(v);
  }

  return Array.from(set)
    .sort((a, b) => a.localeCompare(b, 'zh-Hant'))
    .map((t) => ({ label: t, value: t }));
});

const statusOptions = computed(() => {
  const map = new Map<string, string>(); // key=status, value=statusName

  for (const item of kujiList.value as any[]) {
    const key = String(item?.status ?? '').trim();
    if (!key) continue;

    const label = String(item?.statusName ?? key).trim();
    if (!map.has(key)) map.set(key, label);
  }

  return Array.from(map.entries())
    .sort((a, b) => a[1].localeCompare(b[1], 'zh-Hant'))
    .map(([value, label]) => ({ label, value }));
});

/**  前端篩選：theme/status/keyword */
const filteredList = computed(() => {
  const kw = keyword.value.trim().toLowerCase();

  return (kujiList.value as any[])
    .filter((x) => x.category === currentCategory) // 防呆
    .filter((x) => {
      const okTheme = !filterTheme.value || x.theme === filterTheme.value; //  theme
      const okStatus = !filterStatus.value || x.status === filterStatus.value; //  status

      const title = String(x.title ?? '').toLowerCase();
      const okKw = !kw || title.includes(kw);

      return okTheme && okStatus && okKw;
    });
});

/** pagination（前端） */
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
  router.push({ name: 'IchibanDetail', params: { id } });
};

/**  篩選變動：回到第一頁 */
watch([filterTheme, filterStatus], () => {
  page.value = 1;
});

/** 防呆：總頁數變小避免 page 超出 */
watch(totalPages, (tp) => {
  if (page.value > tp) page.value = tp;
});
</script>

<style scoped lang="scss">
.official-ichiban {
  width: 100%;
  background: #fff;
  display: flex;
  justify-content: center;
}

.official-ichiban__container {
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
  padding: 24px 18px 40px;

  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.official-ichiban__header {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 18px;
}

.official-ichiban__title {
  margin: 0;
  font-size: 24px;
  font-weight: 900;
  color: rgba(0, 0, 0, 0.78);
}

.official-ichiban__filters {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
}

.official-ichiban__selects {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.official-ichiban__state {
  padding: 18px 0;
  text-align: center;
  font-weight: 800;
  color: rgba(0, 0, 0, 0.62);
}
.official-ichiban__state.is-error {
  color: #b43325;
}

.official-ichiban__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  align-items: start;
  justify-content: center;

  :deep(.kuji-card) {
    max-width: 100%;
  }
}

.official-ichiban__pagination {
  margin-top: 26px;
  display: flex;
  justify-content: center;
}

@media (max-width: 1024px) {
  .official-ichiban__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .official-ichiban__filters {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
    align-items: stretch;
  }

  .official-ichiban__selects {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .official-ichiban__selectItem {
    width: 100%;
  }

  :deep(.m-select) {
    width: 100%;
  }

  :deep(.m-select .m-select__control) {
    width: 100%;
  }

  .official-ichiban__searchItem {
    width: 100%;
  }

  :deep(.m-search) {
    width: 100%;
  }

  .official-ichiban__grid {
    grid-template-columns: 1fr;
  }
}
</style>
