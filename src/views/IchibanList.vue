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

const router = useRouter();
const route = useRoute();

const typeToTitle: Record<string, string> = {
  kuji: '官方一番賞',
  gacha: '扭蛋',
  scratch: '刮刮樂',
  custom: '自製一番賞',
  card: '卡牌',
};

const currentType = computed(() => String(route.query.type ?? 'kuji'));
const pageTitle = computed(() => typeToTitle[currentType.value] ?? '商城');

const currentTheme = ref(DEFAULT_THEME);
const currentSort = ref(DEFAULT_SORT);

const resetUiState = () => {
  currentSort.value = DEFAULT_SORT;
  currentTheme.value = DEFAULT_THEME;
  currentPage.value = DEFAULT_PAGE;
};

const sortTabs = [
  { label: '最新', value: 'latest' },
  { label: '最熱銷', value: 'hot' },
  { label: '價格低到高', value: 'priceAsc' },
  { label: '價格高到低', value: 'priceDesc' },
];

const {
  page: currentPage,
  size: pageSize,
  total,
  totalPages,
  hasNext,
  hasPrevious,
  sync,
} = useServerPagination(12);

const loading = ref(true);
const hasLoaded = ref(false);
const errorMsg = ref('');
const kujiList = ref<any[]>([]);
const themeOptions = ref<Array<{ label: string; value: string }>>([
  { label: '全部', value: 'all' },
]);

const fetchList = async () => {
  loading.value = true;
  errorMsg.value = '';

  const baseCondition: BrowseCondition = {
    theme: currentTheme.value !== 'all' ? currentTheme.value : undefined,
  };

  const conditionByType: Record<string, BrowseCondition> = {
    kuji: {
      ...baseCondition,
      category: 'OFFICIAL_ICHIBAN',
    },
    gacha: {
      ...baseCondition,
      category: 'GACHA',
    },
    card: {
      ...baseCondition,
      category: 'TRADING_CARD',
    },
    custom: {
      ...baseCondition,
      category: 'CUSTOM_GACHA',
      subCategory: 'LOTTERY_MODE',
      playMode: 'LOTTERY_MODE',
    },
    scratch: {
      ...baseCondition,
      category: 'CUSTOM_GACHA',
      subCategory: 'SCRATCH_MODE',
      playMode: 'SCRATCH_MODE',
    },
  };

  const sortMap: Record<string, { sortBy: string; sortOrder: 'ASC' | 'DESC' }> =
    {
      latest: { sortBy: 'createdAt', sortOrder: 'DESC' },
      hot: { sortBy: 'hotCount', sortOrder: 'DESC' },
      priceAsc: { sortBy: 'pricePerDraw', sortOrder: 'ASC' },
      priceDesc: { sortBy: 'pricePerDraw', sortOrder: 'DESC' },
    };

  const condition: BrowseCondition =
    conditionByType[currentType.value] ?? conditionByType.kuji;

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
        const mapped = list.map((x: any) => ({
          ...x.lottery,
          prizes: x.prizes,
        }));

        kujiList.value = mapped;
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
          list.map((item) => String(item?.name ?? '').trim()).filter(Boolean),
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
  <main class="ichibanList">
    <div class="ichibanList__inner">
      <header class="ichibanList__hero">
        <div class="ichibanList__heroText">
          <p class="ichibanList__eyebrow">STARO SHOP</p>
          <h1 class="ichibanList__title">{{ pageTitle }}</h1>
          <p class="ichibanList__desc">
            挑選喜歡的主題，找到屬於你的驚喜收藏。
          </p>
        </div>
      </header>

      <section class="ichibanList__panel">
        <div v-if="themeOptions.length > 1" class="ichibanList__section">
          <div class="ichibanList__sectionHead">
            <p class="ichibanList__sectionTitle">主題分類</p>
          </div>

          <div class="ichibanList__themes">
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
        </div>

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
      </section>

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
  </main>
</template>

<style scoped lang="scss">
.ichibanList {
  min-height: 100vh;
  padding: 34px 20px 56px;
  position: relative;
  z-index: 9;
  background:
    radial-gradient(circle at 8% 0%, rgba(180, 51, 37, 0.06), transparent 30%),
    radial-gradient(
      circle at 92% 10%,
      rgba(229, 166, 87, 0.12),
      transparent 28%
    ),
    #fff;

  color: #241610;

  --primary: #b43325;
  --primary-dark: #3f2412;
  --primary-soft: rgba(180, 51, 37, 0.1);
  --gold: #e4aa43;
  --gold-soft: rgba(228, 170, 67, 0.18);
  --cream: #fff8ef;
  --text: #241610;
  --text-soft: rgba(36, 22, 16, 0.58);
  --line: rgba(63, 36, 18, 0.1);
  --danger: #b42318;
}

.ichibanList__inner {
  width: min(1180px, 100%);
  margin: 0 auto;
}

.ichibanList__hero {
  position: relative;
  overflow: hidden;

  min-height: 180px;
  padding: 34px 38px;

  display: flex;
  align-items: center;

  border-radius: 34px;
  background:
    radial-gradient(
      circle at 8% 0%,
      rgba(255, 255, 255, 0.32),
      transparent 32%
    ),
    linear-gradient(135deg, #4a2617 0%, #b43325 58%, #d66b42 100%);
  box-shadow: 0 26px 70px rgba(63, 36, 18, 0.12);

  &::after {
    content: '';
    position: absolute;
    right: -90px;
    top: -110px;
    width: 300px;
    height: 300px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.12);
    pointer-events: none;
  }
}

.ichibanList__heroText {
  position: relative;
  z-index: 1;
}

.ichibanList__eyebrow {
  width: fit-content;
  min-height: 26px;
  padding: 0 12px;
  border-radius: 999px;
  margin: 0 0 10px;

  display: inline-flex;
  align-items: center;

  background: rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.92);

  font-size: 12px;
  font-weight: 950;
  letter-spacing: 1.8px;
}

.ichibanList__title {
  margin: 0;
  color: #fff;
  font-size: 38px;
  line-height: 1.15;
  font-weight: 950;
  letter-spacing: 3px;
}

.ichibanList__desc {
  margin: 10px 0 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: 15px;
  line-height: 1.7;
  font-weight: 800;
}

.ichibanList__panel {
  margin-top: 22px;
  padding: 22px;

  border-radius: 28px;
  background: #fff;
  border: 1px solid var(--line);
  box-shadow: 0 18px 48px rgba(63, 36, 18, 0.08);
}

.ichibanList__section + .ichibanList__sortBar {
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid var(--line);
}

.ichibanList__sectionHead {
  margin-bottom: 12px;
}

.ichibanList__sectionTitle {
  margin: 0;
  color: var(--text);
  font-size: 16px;
  font-weight: 950;
  letter-spacing: 1px;
}

.ichibanList__themes {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.ichibanList__chip {
  min-height: 38px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid rgba(180, 51, 37, 0.14);

  background: #fff;
  color: rgba(36, 22, 16, 0.68);

  font-size: 14px;
  font-weight: 900;
  cursor: pointer;

  transition:
    transform 0.16s ease,
    border-color 0.16s ease,
    background 0.16s ease,
    color 0.16s ease,
    box-shadow 0.16s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(180, 51, 37, 0.32);
    background: var(--primary-soft);
    color: var(--primary);
  }

  &--active {
    border-color: var(--primary);
    background: linear-gradient(135deg, var(--primary) 0%, #d66b42 100%);
    color: #fff;
    box-shadow: 0 12px 24px rgba(180, 51, 37, 0.18);
  }
}

.ichibanList__sortBar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.ichibanList__sortLabel {
  flex: 0 0 auto;
  color: var(--text);
  font-size: 15px;
  font-weight: 950;
}

.ichibanList__sortTabs {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.ichibanList__sortTab {
  min-height: 40px;
  padding: 0 16px;
  border-radius: 15px;
  border: 1px solid var(--line);

  background: var(--cream);
  color: var(--text-soft);

  font-size: 14px;
  font-weight: 900;
  cursor: pointer;

  transition:
    transform 0.16s ease,
    border-color 0.16s ease,
    background 0.16s ease,
    color 0.16s ease,
    box-shadow 0.16s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(180, 51, 37, 0.28);
    color: var(--primary);
    box-shadow: 0 10px 20px rgba(63, 36, 18, 0.06);
  }

  &--active {
    border-color: rgba(180, 51, 37, 0.28);
    background: var(--primary-soft);
    color: var(--primary);
    box-shadow: 0 10px 22px rgba(180, 51, 37, 0.08);
  }
}

.ichibanList__state {
  margin-top: 22px;
  padding: 44px 20px;

  border-radius: 28px;
  background: #fff;
  border: 1px solid var(--line);
  box-shadow: 0 18px 48px rgba(63, 36, 18, 0.08);

  &--error {
    border-color: rgba(180, 35, 24, 0.18);
    background: rgba(180, 35, 24, 0.035);
  }
}

.ichibanList__grid {
  margin-top: 24px;

  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 22px;
}

.ichibanList__card {
  cursor: pointer;
  transition:
    transform 0.18s ease,
    filter 0.18s ease;

  &:hover {
    transform: translateY(-4px);
    filter: drop-shadow(0 18px 24px rgba(63, 36, 18, 0.12));
  }
}

.ichibanList__pagination {
  margin-top: 34px;
}

@media (max-width: 1100px) {
  .ichibanList__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 820px) {
  .ichibanList {
    padding: 22px 16px 44px;
  }

  .ichibanList__hero {
    min-height: 158px;
    padding: 30px 26px;
    border-radius: 30px;
  }

  .ichibanList__title {
    font-size: 32px;
  }

  .ichibanList__panel {
    border-radius: 24px;
  }

  .ichibanList__sortBar {
    align-items: flex-start;
    flex-direction: column;
  }

  .ichibanList__sortTabs {
    width: 100%;
    justify-content: flex-start;
  }

  .ichibanList__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }
}

@media (max-width: 560px) {
  .ichibanList {
    padding: 0 0 36px;
    background:
      radial-gradient(
        circle at 8% 0%,
        rgba(180, 51, 37, 0.06),
        transparent 34%
      ),
      #fff;
  }

  .ichibanList__inner {
    width: 100%;
  }

  .ichibanList__hero {
    min-height: 136px;
    padding: 24px 18px;
    border-radius: 0 0 28px 28px;
    box-shadow: 0 14px 28px rgba(63, 36, 18, 0.12);
  }

  .ichibanList__title {
    font-size: 28px;
    letter-spacing: 2px;
  }

  .ichibanList__desc {
    font-size: 13px;
  }

  .ichibanList__eyebrow {
    min-height: 24px;
    padding: 0 10px;
    margin-bottom: 8px;
    font-size: 11px;
    letter-spacing: 1.3px;
  }

  .ichibanList__panel {
    margin: 16px 14px 0;
    padding: 16px;
    border-radius: 22px;
  }

  .ichibanList__themes {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 4px;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .ichibanList__chip {
    flex: 0 0 auto;
    min-height: 36px;
    padding: 0 14px;
    font-size: 13px;
  }

  .ichibanList__sortTabs {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 9px;
  }

  .ichibanList__sortTab {
    width: 100%;
    min-height: 40px;
    padding: 0 10px;
    border-radius: 14px;
    font-size: 13px;
  }

  .ichibanList__state {
    margin: 16px 14px 0;
    padding: 36px 14px;
    border-radius: 22px;
  }

  .ichibanList__grid {
    margin: 18px 14px 0;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .ichibanList__pagination {
    margin: 26px 14px 0;
  }
}

@media (max-width: 380px) {
  .ichibanList__hero {
    padding-left: 16px;
    padding-right: 16px;
  }

  .ichibanList__title {
    font-size: 26px;
  }

  .ichibanList__panel,
  .ichibanList__grid,
  .ichibanList__state,
  .ichibanList__pagination {
    margin-left: 12px;
    margin-right: 12px;
  }

  .ichibanList__sortTabs {
    grid-template-columns: 1fr;
  }
}
</style>
