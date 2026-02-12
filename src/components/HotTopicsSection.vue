<template>
  <section class="hot-topics">
    <div class="hot-topics__inner">
      <h2 class="hot-topics__title">熱門主題</h2>

      <div class="hot-topics__content">
        <!-- 左側主視覺 -->
        <div class="hot-topics__visual">
          <img class="hot-topics__visual-img" :src="visualSrc" alt="" />
        </div>

        <!-- 右側主題 -->
        <div class="hot-topics__tags">
          <button
            v-for="t in topics"
            :key="t"
            class="hot-topics__tag"
            :class="{ 'hot-topics__tag--hot': hotSet.has(t) }"
            type="button"
            @click="onClick(t)"
          >
            {{ t }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import visualSrc from '@/assets/image/hot-topics-visual.png';

import { queryThemes, type CategoryRes } from '@/services/categoryService';
import { executeApi } from '@/utils/executeApiUtils';

const router = useRouter();
const loading = ref(false);
const topics = ref<string[]>([]);

/* -----------------------------
 * 需要紅色的（可以改成依 value 判斷）
 * ----------------------------- */
const hotSet = new Set<string>([
  '鋼彈系列',
  '進擊的巨人',
  '吉伊卡哇',
  '星際大戰',
]);

/* -----------------------------
 * 點擊事件 - 跳轉到商品列表並篩選主題
 * ----------------------------- */
const onClick = (t: string) => {
  console.log('topic click:', t);
  // 跳轉到一番賞列表並帶上主題標籤
  router.push({ name: 'IchibanList', query: { type: 'kuji', tag: t } });
};

/* -----------------------------
 * 取得主題
 * ----------------------------- */
const fetchCategories = async () => {
  loading.value = true;

  await executeApi({
    fn: () => queryThemes(),
    showCatchDialog: false,
    showFailDialog: false,
    onSuccess: (res: any) => {
      // res.data 是 CategoryRes[]
      const list: CategoryRes[] = Array.isArray(res) ? res : (res?.data ?? []);

      // 只取 name 欄位
      topics.value = list.map((item) => item.name);
    },
  });

  loading.value = false;
};

onMounted(() => {
  fetchCategories();
});
</script>

<style scoped lang="scss">
.hot-topics {
  width: 100%;
  background: #fff;

  &__inner {
    max-width: 1180px;
    margin: 0 auto;
    padding: 84px 24px 110px 24px;
  }

  &__title {
    font-size: 26px;
    font-weight: 800;
    color: #515151;
    letter-spacing: 1px;
    margin: 0 0 36px 0;
  }

  &__content {
    display: grid;
    grid-template-columns: 420px 1fr;
    gap: 56px;
    align-items: center;
  }

  &__visual {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__visual-img {
    width: 100%;
    max-width: 420px;
    height: auto;
    display: block;
    object-fit: contain;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 18px 26px;
    align-content: center;
  }

  &__tag {
    appearance: none;
    border: 0;
    background: transparent;
    padding: 0;
    cursor: pointer;

    font-size: 18px;
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: 0.5px;
    color: rgba(0, 0, 0, 0.82);

    transition:
      transform 120ms ease,
      opacity 120ms ease;

    &:hover {
      transform: translateY(-1px);
      opacity: 0.92;
    }

    &:active {
      transform: translateY(0);
      opacity: 0.85;
    }

    &:focus-visible {
      outline: 3px solid rgba(0, 0, 0, 0.18);
      outline-offset: 4px;
      border-radius: 6px;
    }

    &--hot {
      color: #b43325;
    }
  }
}

@media (max-width: 1024px) {
  .hot-topics {
    &__inner {
      padding: 64px 20px 84px 20px;
    }

    &__content {
      grid-template-columns: 360px 1fr;
      gap: 36px;
    }

    &__tag {
      font-size: 16px;
    }
  }
}

@media (max-width: 768px) {
  .hot-topics {
    &__content {
      grid-template-columns: 1fr;
      gap: 28px;
    }

    &__visual-img {
      max-width: 360px;
    }

    &__tags {
      justify-content: center;
      gap: 14px 18px;
    }

    &__title {
      text-align: center;
    }
  }
}
</style>
