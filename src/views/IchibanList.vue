<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import IchibanKujiCard from '@/components/IchibanKujiCard.vue';
import BasePagination from '@/components/common/BasePagination.vue';
import NoData from '@/components/common/NoData.vue';
import { queryBrowseLotteries, type BrowseCondition } from '@/services/lotteryBrowseService';
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
  kuji: 'OFFICIAL_ICHIBAN', // 官方一番賞
  gacha: 'GACHA', // 扭蛋
  custom: 'CUSTOM_GACHA', // 自製賞
  card: 'TRADING_CARD', // 卡牌
};
const typeToTitle: Record<string, string> = {
  kuji: '一番賞',
  gacha: '扭蛋',
  custom: '自製賞',
  card: '卡牌',
};

const pageTitle = computed(() => typeToTitle[currentType.value] ?? '商城');

const currentType = computed(() => String(route.query.type ?? 'kuji'));

const currentCategory = ref<string>('all');

const currentTag = ref('all');

const sortTabs = [
  { label: '最新', value: 'latest' },
  { label: '最熱銷', value: 'hot' },
  { label: '價格低到高', value: 'priceAsc' },
  { label: '價格高到低', value: 'priceDesc' },
];

const currentSort = ref('latest');

const pageSize = 12;
const currentPage = ref(1);

/** API data */
const loading = ref(false);
const errorMsg = ref('');
const kujiList = ref([]);

/* ------------------------------
 * categories chips (dynamic)
 * ------------------------------ */
const categories = computed(() => {
  const map = new Map<string, string>(); // key=category, value=categoryName

  for (const item of kujiList.value) {
    const key = item.category;
    const name = item.categoryName || item.category || '其他';
    if (!map.has(key)) map.set(key, name);
  }

  const chips = Array.from(map.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, 'zh-Hant'));

  return [{ label: '全部', value: 'all' }, ...chips];
});
const tags = computed(() => {
  const set = new Set<string>();

  for (const item of kujiList.value as any[]) {
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
  const condition: BrowseCondition = {};
  
  // 只在初始載入時，如果 URL 有 tag 參數，才加到 condition
  const urlTag = route.query.tag;
  if (urlTag && typeof urlTag === 'string' && urlTag !== 'all') {
    condition.theme = urlTag;
  }
  
  await executeApi({
    fn: () => queryBrowseLotteries({ condition }),
    onSuccess: async (data) => {
      const arr = Array.isArray(data) ? data : [];
      kujiList.value = arr.map((x) => {
        return { ...x.lottery, prizes: x.prizes };
      });
    },
  });
};

/* ------------------------------
 * filter/sort/pagination
 * ------------------------------ */
const filteredList = computed(() => {
  let list = kujiList.value as any[];

  if (currentCategory.value !== 'all') {
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
      return list.sort((a, b) => a.currentPrice - b.currentPrice);
    case 'priceDesc':
      return list.sort((a, b) => b.currentPrice - a.currentPrice);
    case 'hot':
      return list.sort((a, b) => a.hotCount - b.hotCount);
    case 'latest':
    default:
      return list.sort((a, b) => {
        const at = a.createdAt;
        const bt = b.createdAt;
        return new Date(bt).getTime() - new Date(at).getTime();
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

/* ------------------------------
 * 從 URL 讀取主題參數（只在初始時設定）
 * ------------------------------ */
watch(
  () => route.query.tag,
  (tag) => {
    if (tag && typeof tag === 'string') {
      currentTag.value = tag;
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
      <!-- 標題 -->
      <header class="ichibanList__header">
        <h1 class="ichibanList__title">{{ pageTitle }}</h1>

        <div class="ichibanList__tags" v-if="tags.length > 1">
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

      <!-- 排序 tabs -->
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

      <!-- Loading / Error / Empty -->
      <div v-if="loading" class="ichibanList__state">載入中...</div>
      <div
        v-else-if="errorMsg"
        class="ichibanList__state ichibanList__state--error"
      >
        {{ errorMsg }}
      </div>
      <div v-else-if="sortedList.length === 0" class="ichibanList__state">
        <NoData message="目前沒有商品" />
      </div>

      <!-- 商品列表 -->
      <section v-else class="ichibanList__grid">
        <IchibanKujiCard
          v-for="item in pagedList"
          :key="item.id"
          class="ichibanList__card"
          :item="item"
          @click="goDetail(item.id)"
        />
      </section>

      <!-- 分頁 -->
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
