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
import { executeApi } from '@/utils/executeApiUtils';

const DEFAULT_SORT = 'latest';
const DEFAULT_TAG = 'all';
const DEFAULT_PAGE = 1;

const resetUiState = () => {
  currentSort.value = DEFAULT_SORT;
  currentTag.value = DEFAULT_TAG;
  currentPage.value = DEFAULT_PAGE;
};

const router = useRouter();
const route = useRoute();

const typeToCategory: Record<string, string | 'all'> = {
  kuji: 'OFFICIAL_ICHIBAN',
  gacha: 'GACHA',
  scratch: 'SCRATCH',
  custom: 'CUSTOM_GACHA',
  card: 'TRADING_CARD',
};

const typeToTitle: Record<string, string> = {
  kuji: '一番賞',
  gacha: '扭蛋',
  scratch: '刮刮樂',
  custom: '自製賞',
  card: '卡牌',
};

/** 判斷商品是否屬於刮刮樂（以 playMode 為主） */
const isScratchItem = (item: any) => {
  const m = String(item?.playMode ?? '').toUpperCase();
  return m === 'SCRATCH_MODE' || m === 'SCRATCH_CARD_MODE';
};

/** 判斷商品是否屬於真正的扭蛋（category=GACHA 且非刮刮樂 playMode） */
const isGachaItem = (item: any) => {
  const category = String(item?.category ?? '').toUpperCase();
  return category === 'GACHA' && !isScratchItem(item);
};

const pageTitle = computed(() => typeToTitle[currentType.value] ?? '商城');

const currentType = computed(() => String(route.query.type ?? 'kuji'));

const currentCategory = ref<string>('all');
const currentTag = ref(DEFAULT_TAG);

const sortTabs = [
  { label: '最新', value: 'latest' },
  { label: '最熱銷', value: 'hot' },
  { label: '價格低到高', value: 'priceAsc' },
  { label: '價格高到低', value: 'priceDesc' },
];

const currentSort = ref(DEFAULT_SORT);

const pageSize = 12;
const currentPage = ref(DEFAULT_PAGE);

/** API data */
const loading = ref(true);
const hasLoaded = ref(false);
const errorMsg = ref('');
const kujiList = ref<any[]>([]);

/* ------------------------------
 * categories chips (dynamic)
 * ------------------------------ */
const categories = computed(() => {
  const map = new Map<string, string>();

  for (const item of kujiList.value) {
    const key = item.category;
    const name = item.categoryName || item.category || '其他';
    if (key && !map.has(key)) map.set(key, name);
  }

  const chips = Array.from(map.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, 'zh-Hant'));

  return [{ label: '全部', value: 'all' }, ...chips];
});

const tags = computed(() => {
  const set = new Set<string>();

  for (const item of kujiList.value) {
    const arr = Array.isArray(item?.tags) ? item.tags : [];
    for (const t of arr) {
      const s = String(t ?? '').trim();
      if (s) set.add(s);
    }
  }

  const chips = Array.from(set)
    .map((t) => ({ label: t, value: t }))
    .sort((a, b) => a.label.localeCompare(b.label, 'zh-Hant'));

  return [{ label: '全部', value: 'all' }, ...chips];
});

/* ------------------------------
 * fetch
 * ------------------------------ */
const fetchList = async () => {
  loading.value = true;
  errorMsg.value = '';

  const condition: BrowseCondition = {};

  const urlTag = route.query.tag;
  if (urlTag && typeof urlTag === 'string' && urlTag !== 'all') {
    condition.theme = urlTag;
  }

  try {
    await executeApi({
      fn: () => queryBrowseLotteries({ condition }),
      onSuccess: async (data) => {
        const arr = Array.isArray(data) ? data : [];
        kujiList.value = arr.map((x: any) => ({
          ...x.lottery,
          prizes: x.prizes,
        }));
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

/* ------------------------------
 * filter/sort/pagination
 * ------------------------------ */
const filteredList = computed(() => {
  let list = kujiList.value as any[];
  const type = currentType.value;

  if (type === 'scratch') {
    list = list.filter((item) => isScratchItem(item));
  } else if (type === 'gacha') {
    list = list.filter((item) => isGachaItem(item));
  } else if (currentCategory.value !== 'all') {
    list = list.filter((item) => item.category === currentCategory.value);
  }

  if (currentTag.value !== 'all') {
    list = list.filter((item) => {
      const arr = Array.isArray(item?.tags) ? item.tags : [];
      return arr.includes(currentTag.value);
    });
  }

  return list;
});

const sortedList = computed(() => {
  const list = [...filteredList.value];

  switch (currentSort.value) {
    case 'priceAsc':
      return list.sort((a, b) => (a.currentPrice ?? 0) - (b.currentPrice ?? 0));
    case 'priceDesc':
      return list.sort((a, b) => (b.currentPrice ?? 0) - (a.currentPrice ?? 0));
    case 'hot':
      return list.sort((a, b) => (b.hotCount ?? 0) - (a.hotCount ?? 0));
    case 'latest':
    default:
      return list.sort((a, b) => {
        const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bt - at;
      });
  }
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(sortedList.value.length / pageSize)),
);

const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return sortedList.value.slice(start, start + pageSize);
});

/* ------------------------------
 * state display
 * ------------------------------ */
const stateMessage = computed(() => {
  if (loading.value || !hasLoaded.value) return '載入中...';
  if (errorMsg.value) return errorMsg.value;
  if (sortedList.value.length === 0) return '目前沒有商品';
  return '';
});

const showState = computed(() => !!stateMessage.value);
const isErrorState = computed(() => !!errorMsg.value);

watch([currentCategory, currentTag, currentSort], () => {
  currentPage.value = 1;
});

watch(
  categories,
  () => {
    const exists = categories.value.some(
      (c) => c.value === currentCategory.value,
    );
    if (!exists) currentCategory.value = 'all';
  },
  { immediate: true },
);

watch(
  tags,
  () => {
    const exists = tags.value.some((t) => t.value === currentTag.value);
    if (!exists) currentTag.value = 'all';
  },
  { immediate: true },
);

watch(
  currentType,
  (type) => {
    currentCategory.value = typeToCategory[type] ?? 'all';
    resetUiState();
  },
  { immediate: true },
);

watch(
  () => route.query.tag,
  (tag) => {
    if (tag && typeof tag === 'string') {
      currentTag.value = tag;
    } else {
      currentTag.value = DEFAULT_TAG;
    }
  },
  { immediate: true },
);

/* ------------------------------
 * nav
 * ------------------------------ */
const goDetail = (id: string) => {
  router.push({ name: 'IchibanDetail', params: { id } });
};

onMounted(async () => {
  await fetchList();
});
</script>

<template>
  <div class="ichibanList">
    <div class="ichibanList__inner">
      <header class="ichibanList__header">
        <h1 class="ichibanList__title">{{ pageTitle }}</h1>

        <div v-if="tags.length > 1" class="ichibanList__tags">
          <button
            v-for="t in tags"
            :key="t.value"
            type="button"
            class="ichibanList__chip"
            :class="{
              'ichibanList__chip--active': currentTag === t.value,
            }"
            @click="currentTag = t.value"
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
          v-for="item in pagedList"
          :key="item.id"
          class="ichibanList__card"
          :item="item"
          @click="goDetail(item.id)"
        />
      </section>

      <BasePagination
        v-if="!loading && !errorMsg && sortedList.length > 0"
        class="ichibanList__pagination"
        :page="currentPage"
        :total-pages="totalPages"
        :max-visible="5"
        @update:page="currentPage = $event"
      />
    </div>
  </div>
</template>
