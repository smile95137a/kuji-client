<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import IchibanKujiCard from '@/components/IchibanKujiCard.vue';
import BasePagination from '@/components/common/BasePagination.vue';
import demo1 from '@/assets/image/demo1.jpg';

import { queryBrowseLotteries } from '@/services/lotteryBrowseService';

type CategoryValue =
  | 'all'
  | 'ichiban'
  | 'figure'
  | 'prize'
  | 'gacha'
  | 'box'
  | 'others';

type SortValue = 'latest' | 'hot' | 'priceAsc' | 'priceDesc';

type KujiItem = {
  id: string; // UUID
  title: string;
  bannerSrc: string;
  remaining: number; // remainingDraws（或 remainingPrizes）
  timeText: string;
  tagText: string;
  category: CategoryValue;
  basePrice: number;

  // 給排序用（可選）
  orderNum?: number;
  scheduledAt?: string;
  createdAt?: string;
  endTime?: string;
};

const router = useRouter();

const categories = [
  { label: '全部', value: 'all' as CategoryValue },
  { label: '一番賞', value: 'ichiban' as CategoryValue },
  { label: '景品 / 公仔', value: 'figure' as CategoryValue },
  { label: '獎品組', value: 'prize' as CategoryValue },
  { label: '扭蛋', value: 'gacha' as CategoryValue },
  { label: '盒玩', value: 'box' as CategoryValue },
  { label: '其他', value: 'others' as CategoryValue },
];

const sortTabs = [
  { label: '最新', value: 'latest' as SortValue },
  { label: '最熱銷', value: 'hot' as SortValue },
  { label: '價格低到高', value: 'priceAsc' as SortValue },
  { label: '價格高到低', value: 'priceDesc' as SortValue },
];

const currentCategory = ref<CategoryValue>('all');
const currentSort = ref<SortValue>('latest');

const pageSize = 12;
const currentPage = ref(1);

/** API data */
const loading = ref(false);
const errorMsg = ref('');
const kujiList = ref<KujiItem[]>([]);

/* ------------------------------
 * mapping helpers
 * ------------------------------ */
const formatDate = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}/${m}/${day}`;
};

const toCategoryValue = (
  category?: string,
  _subCategory?: string,
): CategoryValue => {
  const c = String(category ?? '').toUpperCase();

  // 你提供的 res：OFFICIAL_ICHIBAN => ichiban
  if (c === 'OFFICIAL_ICHIBAN') return 'ichiban';

  // 其他未對應先丟 others（你之後有新增分類再補）
  return 'others';
};

const toKujiItem = (x: any): KujiItem => {
  const id = String(x?.id ?? '');
  const title = String(x?.title ?? '未命名商品');
  const bannerSrc = String(x?.imageUrl ?? '') || demo1;

  // ✅ 卡片顯示 remaining：先用 remainingDraws（抽數剩餘）
  // 如果你想顯示「獎品剩餘」就改成 remainingPrizes
  const remaining = Number(x?.remainingDraws ?? x?.remainingPrizes ?? 0) || 0;

  // ✅ 價格：優先 currentPrice，沒有就 pricePerDraw
  const basePrice = Number(x?.currentPrice ?? x?.pricePerDraw ?? 0) || 0;

  const category = toCategoryValue(x?.category, x?.subCategory);

  // ✅ tagText：用 categoryName 或 storeName
  const tagText = String(x?.categoryName ?? x?.storeName ?? 'HOT');

  // ✅ timeText：用活動區間
  const start = formatDate(x?.startTime);
  const end = formatDate(x?.endTime);
  const timeText =
    start && end
      ? `${start} - ${end}`
      : end
        ? `至 ${end}`
        : start
          ? `自 ${start}`
          : '-';

  return {
    id,
    title,
    bannerSrc,
    remaining,
    timeText,
    tagText,
    category,
    basePrice,

    orderNum: x?.orderNum ?? undefined,
    scheduledAt: x?.scheduledAt ?? undefined,
    createdAt: x?.createdAt ?? undefined,
    endTime: x?.endTime ?? undefined,
  };
};

/* ------------------------------
 * fetch
 * ------------------------------ */
const fetchList = async () => {
  loading.value = true;
  errorMsg.value = '';

  try {
    const resp = await queryBrowseLotteries({ condition: {} });

    // 你系統常見回傳：{ success, data }
    const data = (resp as any)?.data ?? resp;

    const arr = Array.isArray(data) ? data : [];
    kujiList.value = arr.map((x: any) => toKujiItem(x));
  } catch (e: any) {
    console.error(e);
    errorMsg.value = '載入商品失敗，請稍後再試';
    kujiList.value = [];
  } finally {
    loading.value = false;
  }
};

/* ------------------------------
 * filter/sort/pagination
 * ------------------------------ */
const filteredList = computed(() => {
  if (currentCategory.value === 'all') return kujiList.value;
  return kujiList.value.filter(
    (item) => item.category === currentCategory.value,
  );
});

const sortedList = computed(() => {
  const list = [...filteredList.value];

  switch (currentSort.value) {
    case 'priceAsc':
      return list.sort((a, b) => a.basePrice - b.basePrice);
    case 'priceDesc':
      return list.sort((a, b) => b.basePrice - a.basePrice);
    case 'hot':
      // demo：remaining 少的當作較熱
      return list.sort((a, b) => a.remaining - b.remaining);
    case 'latest':
    default:
      // ✅ 改成用 scheduledAt / createdAt 當最新排序（比 id 更準）
      return list.sort((a, b) => {
        const at = a.scheduledAt || a.createdAt || '';
        const bt = b.scheduledAt || b.createdAt || '';
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

watch([currentCategory, currentSort], () => {
  currentPage.value = 1;
});

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
        <h1 class="ichibanList__title">商城</h1>

        <!-- 類別 chips -->
        <div class="ichibanList__categories">
          <button
            v-for="cat in categories"
            :key="cat.value"
            type="button"
            class="ichibanList__chip"
            :class="{
              'ichibanList__chip--active': currentCategory === cat.value,
            }"
            @click="currentCategory = cat.value"
          >
            {{ cat.label }}
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
        目前沒有商品
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

      <!-- 分頁 ㄈ-->
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

<style scoped lang="scss">
.ichibanList {
  padding: 40px 0 80px;
  background: linear-gradient(180deg, #f4e1cc 0%, #f8efe3 40%, #ffffff 100%);

  &__inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px 48px;
  }

  &__header {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 24px;
  }

  &__title {
    font-size: 28px;
    font-weight: 900;
    color: #3f2412;
  }

  &__categories {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__chip {
    border-radius: 999px;
    border: 1px solid transparent;
    padding: 8px 18px;
    font-size: 14px;
    background: #f4e1cc;
    color: #3f2412;
    cursor: pointer;
    transition: all 0.2s ease;

    &--active {
      background: #eb6c4d;
      color: #fff;
    }

    &:hover {
      filter: brightness(0.96);
    }
  }

  &__sortBar {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
  }

  &__sortLabel {
    font-size: 14px;
    color: #666;
  }

  &__sortTabs {
    display: inline-flex;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.8);
    padding: 2px;
    gap: 4px;
  }

  &__sortTab {
    border-radius: 999px;
    border: none;
    padding: 6px 12px;
    font-size: 13px;
    background: transparent;
    color: #8c5b3b;
    cursor: pointer;
    transition: all 0.2s ease;

    &--active {
      background: #3f2412;
      color: #fff;
    }
  }

  &__state {
    padding: 24px 0;
    text-align: center;
    color: #3f2412;
    opacity: 0.9;

    &--error {
      color: #b42318;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 28px 24px;
  }

  @media (max-width: 900px) {
    &__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 600px) {
    &__grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  &__pagination {
    margin-top: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    font-size: 14px;
  }
}
</style>
