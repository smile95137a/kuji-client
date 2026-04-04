<template>
  <div class="storeList">
    <header class="storeList__header">
      <h1 class="storeList__title">精選店家</h1>
      <p class="storeList__subtitle">探索我們合作的優質一番賞店家</p>
    </header>

    <!-- 搜尋列 -->
    <div class="storeList__search">
      <input
        v-model="keyword"
        type="search"
        placeholder="搜尋店家名稱或描述..."
        class="storeList__searchInput"
        aria-label="搜尋店家"
      />
      <span v-if="keyword" class="storeList__searchCount">
        找到 {{ filteredStores.length }} 家
      </span>
      <button v-if="keyword" class="storeList__clearBtn" type="button" @click="keyword = ''" aria-label="清除搜尋">
        ×
      </button>
    </div>

    <!-- 載入中 -->
    <div v-if="loading" class="storeList__grid">
      <div v-for="n in 6" :key="n" class="storeList__skeleton"></div>
    </div>

    <!-- 空狀態 -->
    <div v-else-if="filteredStores.length === 0" class="storeList__empty">
      <p class="storeList__emptyText">
        {{ keyword ? `找不到「${keyword}」的店家` : '目前沒有可用店家' }}
      </p>
      <button v-if="keyword" class="storeList__emptyBtn" @click="keyword = ''">
        清除搜尋
      </button>
    </div>

    <!-- 店家格子 -->
    <div v-else class="storeList__grid">
      <StoreCard
        v-for="store in sortedStores"
        :key="store.id"
        :store="store"
        @click="goToStore"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import StoreCard from '@/components/store/StoreCard.vue';
import { getStores, type Store } from '@/services/storeService';
import { executeApi } from '@/utils/executeApiUtils';

const router = useRouter();

const stores = ref<Store[]>([]);
const loading = ref(false);
const keyword = ref('');

const filteredStores = computed(() => {
  const q = keyword.value.trim().toLowerCase();
  if (!q) return stores.value;
  return stores.value.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      (s.description ?? '').toLowerCase().includes(q),
  );
});

// 活躍店家在前，暫停服務在後
const sortedStores = computed(() =>
  [...filteredStores.value].sort((a, b) => {
    if (a.isActive === b.isActive) return 0;
    return a.isActive ? -1 : 1;
  }),
);

const goToStore = (store: Store) => {
  router.push({ name: 'StoreDetail', params: { id: store.id } });
};

onMounted(async () => {
  loading.value = true;
  await executeApi<Store[]>({
    fn: getStores,
    onSuccess: (data) => {
      stores.value = data ?? [];
    },
  });
  loading.value = false;
});
</script>

<style scoped lang="scss">
.storeList {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px;

  &__header {
    margin-bottom: 24px;
  }

  &__title {
    font-size: 1.8rem;
    font-weight: 900;
    margin: 0 0 4px;
    color: #111;
  }

  &__subtitle {
    font-size: 0.95rem;
    color: #666;
    margin: 0;
  }

  &__search {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 24px;
  }

  &__searchInput {
    flex: 1;
    padding: 10px 16px;
    border: 1.5px solid #ddd;
    border-radius: 8px;
    font-size: 0.95rem;
    outline: none;
    transition: border-color 0.2s;

    &:focus {
      border-color: #b2473a;
    }
  }

  &__searchCount {
    font-size: 0.85rem;
    color: #888;
    white-space: nowrap;
  }

  &__clearBtn {
    background: none;
    border: none;
    font-size: 1.2rem;
    color: #999;
    cursor: pointer;
    padding: 4px 8px;
    line-height: 1;

    &:hover { color: #333; }
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;

    @media (min-width: 640px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (min-width: 1024px) {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  &__skeleton {
    height: 220px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 12px;
  }

  &__empty {
    text-align: center;
    padding: 60px 16px;
    color: #888;
  }

  &__emptyText {
    font-size: 1rem;
    margin: 0 0 16px;
  }

  &__emptyBtn {
    padding: 8px 20px;
    background: #b2473a;
    color: #fff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
  }
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
