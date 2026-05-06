<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import IchibanKujiCard from '@/components/IchibanKujiCard.vue';
import BasePagination from '@/components/common/BasePagination.vue';
import NoData from '@/components/common/NoData.vue';
import {
  queryBrowseLotteries,
  type BrowseCondition,
} from '@/services/lotteryBrowseService';
import { queryThemes, type CategoryRes } from '@/services/categoryService';
import { executeApi } from '@/utils/executeApiUtils';
import { useServerPagination } from '@/composables/useServerPagination';

const DEFAULT_SORT = 'latest';
const DEFAULT_THEME = 'all';
const DEFAULT_PAGE = 1;

const resetUiState = () => {
  currentSort.value = DEFAULT_SORT;
  currentTheme.value = DEFAULT_THEME;
  currentPage.value = DEFAULT_PAGE;
};

const router = useRouter();
const route = useRoute();

const typeToTitle: Record<string, string> = {
  kuji: '一番賞',
  gacha: '扭蛋',
  scratch: '刮刮樂',
  custom: '自製賞',
  card: '卡牌',
};

const pageTitle = computed(() => typeToTitle[currentType.value] ?? '商城');

const currentType = computed(() => String(route.query.type ?? 'kuji'));

const currentTheme = ref(DEFAULT_THEME);

const sortTabs = [
  { label: '最新', value: 'latest' },
  { label: '最熱銷', value: 'hot' },
  { label: '價格低到高', value: 'priceAsc' },
  { label: '價格高到低', value: 'priceDesc' },
];

const currentSort = ref(DEFAULT_SORT);

const { page: currentPage, size: pageSize, total, totalPages, hasNext, hasPrevious, sync } =
  useServerPagination(12);

/** API data */
const loading = ref(true);
const hasLoaded = ref(false);
const errorMsg = ref('');
const kujiList = ref<any[]>([]);
const themeOptions = ref<Array<{ label: string; value: string }>>([
  { label: '全部', value: 'all' },
]);

/* ------------------------------
 * categories chips (dynamic)
 * ------------------------------ */
/* ------------------------------
 * fetch
 * ------------------------------ */
const fetchList = async () => {
  loading.value = true;
  errorMsg.value = '';

  const categoryMap: Record<string, string> = {
    kuji: 'OFFICIAL_ICHIBAN',
    gacha: 'GACHA',
    scratch: 'SCRATCH',
    custom: 'CUSTOM_GACHA',
    card: 'TRADING_CARD',
  };

  const sortMap: Record<string, { sortBy: string; sortOrder: 'ASC' | 'DESC' }> = {
    latest: { sortBy: 'createdAt', sortOrder: 'DESC' },
    hot: { sortBy: 'hotCount', sortOrder: 'DESC' },
    priceAsc: { sortBy: 'pricePerDraw', sortOrder: 'ASC' },
    priceDesc: { sortBy: 'pricePerDraw', sortOrder: 'DESC' },
  };

  const condition: BrowseCondition = {
    category: categoryMap[currentType.value],
    theme: currentTheme.value !== 'all' ? currentTheme.value : undefined,
  };

  try {
    await executeApi({
      fn: () =>
        queryBrowseLotteries({
          condition,
          page: currentPage.value,
          size: pageSize.value,
          ...sortMap[currentSort.value],
        }),
      onSuccess: async (result) => {
        const list = result?.data ?? [];
        kujiList.value = list.map((x: any) => ({
          ...x.lottery,
          prizes: x.prizes,
        }));
        sync(result);
      },
      onFail: async (error: any) => {
        console.error('queryBrowseLotteries error:', error);
        errorMsg.value = '商品載入失敗，請稍後再試';
        kujiList.value = [];
      },
    });
  } catch (error) {
    console.error('fetchList error:', error);
    errorMsg.value = '商品載入失敗，請稍後再試';
    kujiList.value = [];
  } finally {
    loading.value = false;
    hasLoaded.value = true;
  }
};

const stateMessage = computed(() => {
  if (loading.value || !hasLoaded.value) return '載入中...';
  if (errorMsg.value) return errorMsg.value;
  if (kujiList.value.length === 0) return '目前沒有商品';
  return '';
});

const showState = computed(() => !!stateMessage.value);
const isErrorState = computed(() => !!errorMsg.value);

watch(
  currentType,
  () => {
    resetUiState();
    currentPage.value = 1;
    fetchList();
  },
  { immediate: true },
);

watch([currentTheme, currentSort], () => {
  currentPage.value = 1;
  fetchList();
});

/* ------------------------------
 * nav
 * ------------------------------ */
const goDetail = (id: string) => {
  router.push({ name: 'IchibanDetail', params: { id } });
};

const goToPage = () => {
  fetchList();
};

const loadThemeOptions = async () => {
  await executeApi({
    fn: () => queryThemes(),
    showCatchDialog: false,
    showFailDialog: false,
    onSuccess: (res: any) => {
      const list: CategoryRes[] = Array.isArray(res) ? res : (res?.data ?? []);
      const chips = Array.from(
        new Set(
          list
            .map((item) => String(item?.name ?? '').trim())
            .filter(Boolean),
        ),
      )
        .sort((a, b) => a.localeCompare(b, 'zh-Hant'))
        .map((value) => ({ label: value, value }));

      themeOptions.value = [{ label: '全部', value: 'all' }, ...chips];
    },
  });
};

onMounted(async () => {
  await loadThemeOptions();
});
</script>

<template>
  <div class="ichibanList">
    <div class="ichibanList__inner">
      <header class="ichibanList__header">
        <h1 class="ichibanList__title">{{ pageTitle }}</h1>

        <div v-if="themeOptions.length > 1" class="ichibanList__themes">
          <button
            v-for="t in themeOptions"
            :key="t.value"
            type="button"
            class="ichibanList__chip"
            :class="{ 'ichibanList__chip--active': currentTheme === t.value }"
            @click="currentTheme = t.value"
          >
            {{ t.label }}
          </button>
        </div>
      </header>

      <div class="ichibanList__sortBar">
        <span class="ichibanList__sortLabel">排序</span>
        <div class="ichibanList__sortTabs">
          <button
            v-for="tab in sortTabs"
            :key="tab.value"
            type="button"
            class="ichibanList__sortTab"
            :class="{
              'ichibanList__sortTab--active': currentSort === tab.value,
            }"
            @click="currentSort = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <div
        v-if="showState"
        class="ichibanList__state"
        :class="{ 'ichibanList__state--error': isErrorState }"
      >
        <NoData :message="stateMessage" />
      </div>

      <section v-else class="ichibanList__grid">
        <IchibanKujiCard
          v-for="item in kujiList"
          :key="item.id"
          class="ichibanList__card"
          :item="item"
          @click="goDetail(item.id)"
        />
      </section>

      <BasePagination
        v-if="!loading && !errorMsg && kujiList.length > 0"
        class="ichibanList__pagination"
        v-model:page="currentPage"
        :total="total"
        :size="pageSize"
        :total-pages="totalPages"
        :has-next="hasNext"
        :has-previous="hasPrevious"
        :max-visible="5"
        @update:page="goToPage"
      />
    </div>
  </div>
</template>
