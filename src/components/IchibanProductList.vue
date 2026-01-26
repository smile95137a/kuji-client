<template>
  <div class="ichiban-list">
    <!-- 標題 -->
    <div class="ichiban-list__title">
      <div class="ichiban-list__title-text">
        {{ title }}
      </div>
    </div>

    <!-- 說明文字 -->
    <p class="ichiban-list__desc" v-if="description">
      {{ description }}
    </p>

    <!-- 商品列表（RWD Grid） -->
    <div class="ichiban-list__grid">
      <article
        v-for="item in displayedProducts"
        :key="item.id"
        class="ichiban-card"
      >
        <div class="ichiban-card__image-wrapper">
          <img :src="p1" :alt="item.name" class="ichiban-card__image" />

          <!-- 獎項標籤 A/B/C賞 -->
          <span class="ichiban-card__badge">
            {{ item.prizeRank }}
          </span>

          <!-- 售完標籤 -->
          <span v-if="item.isSoldOut" class="ichiban-card__sold-out">
            售完
          </span>
        </div>

        <div class="ichiban-card__info">
          <p class="ichiban-card__name">
            {{ item.name }}
          </p>
          <p v-if="item.price" class="ichiban-card__price">
            {{ item.price }}
          </p>
        </div>
      </article>
    </div>

    <!-- 更多按鈕 -->
    <div class="ichiban-list__load-more" v-if="showLoadMore">
      <button class="ichiban-list__btn" type="button" @click="loadMore">
        <span class="ichiban-list__btn-text">看更多獎品</span>
        <i class="fas fa-angle-right ichiban-list__arrow"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import p1 from '@/assets/image/kujiDemoP.jpg';
interface IchibanProduct {
  id: number | string;
  name: string;
  image: string;
  prizeRank: string; // A賞 / B賞 / C賞 …等
  price?: string | number;
  isSoldOut?: boolean;
}

const props = defineProps<{
  title: string;
  description?: string;
  products: IchibanProduct[];
  initialCount?: number;
  step?: number;
}>();

const displayCount = ref(props.initialCount ?? 8);

const displayedProducts = computed(() =>
  props.products.slice(0, displayCount.value)
);

const showLoadMore = computed(
  () => displayedProducts.value.length < props.products.length
);

const loadMore = () => {
  displayCount.value += props.step ?? 8;
};
</script>

<style lang="scss" scoped>
.ichiban-list {
  &__title {
    border-bottom: 2px solid #a53b25;
    margin-bottom: 8px;

    &-text {
      width: 100%;
      max-width: 392px;
      background: #a53b25;
      color: #fff;
      padding: 12px;
      font-size: 20px;
      font-weight: bold;
      letter-spacing: 0.08em;
    }
  }

  &__desc {
    margin-bottom: 20px;
    font-size: 14px;
    color: #333;
    line-height: 1.6;
  }

  /* RWD Grid */
  &__grid {
    display: grid;
    gap: 20px;

    /* 手機：2 欄 */
    grid-template-columns: repeat(2, minmax(0, 1fr));

    @media (min-width: 768px) {
      /* 平板：3 欄 */
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 24px;
    }

    @media (min-width: 1024px) {
      /* 桌機：4 欄 */
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 28px;
    }
  }

  &__load-more {
    margin-top: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__btn {
    background-color: #3c2313;
    color: #ffbf45;
    border: none;
    padding: 10px 24px;
    font-size: 14px;
    font-weight: bold;
    border-radius: 999px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: background-color 0.2s, transform 0.15s;
    width: 100%;
    max-width: 200px;

    &:hover {
      background-color: #5a2a0c;
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  }

  &__btn-text {
    display: flex;
    flex: 1;
    justify-content: center;
  }

  &__arrow {
    font-size: 12px;
  }
}

/* 一番賞卡片 */
.ichiban-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);

    .ichiban-card__image {
      transform: scale(1.05);
    }
  }

  &__image-wrapper {
    position: relative;
    width: 100%;
    padding-top: 100%; // 正方形比例
    overflow: hidden;
    background: linear-gradient(135deg, #fff1c6, #ffe8d2);
  }

  &__image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.25s ease;
  }

  /* A賞 / B賞 標籤 */
  &__badge {
    position: absolute;
    left: 10px;
    top: 10px;
    padding: 4px 10px;
    border-radius: 999px;
    background: linear-gradient(135deg, #ffbf45, #ff8c3a);
    color: #3c2313;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
  }

  /* 售完標籤 */
  &__sold-out {
    position: absolute;
    right: 8px;
    top: 8px;
    padding: 3px 8px;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    font-size: 11px;
  }

  &__info {
    padding: 10px 12px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__name {
    font-size: 14px;
    font-weight: 600;
    color: #3c2313;
    line-height: 1.4;
    min-height: 2.8em; // 兩行高度，避免高度忽高忽低
  }

  &__price {
    font-size: 12px;
    color: #a53b25;
  }
}
</style>
