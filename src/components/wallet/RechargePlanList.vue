<!-- src/components/wallet/RechargePlanList.vue -->
<template>
  <div class="rechargePlanList">
    <div v-if="loading" class="rechargePlanList__empty">載入方案中…</div>

    <div v-else-if="plans.length === 0" class="rechargePlanList__empty">
      目前沒有可用方案
    </div>

    <div v-else class="rechargePlanList__grid">
      <button
        v-for="plan in plans"
        :key="plan.id"
        type="button"
        class="rechargePlanList__item"
        :class="{
          'rechargePlanList__item--active': selectedId === plan.id,
          'rechargePlanList__item--hot': plan.isHot,
        }"
        @click="emit('select', plan)"
      >
        <span v-if="plan.isHot" class="rechargePlanList__hotBadge">熱門</span>

        <div class="rechargePlanList__top">
          <span class="rechargePlanList__name">{{ plan.name }}</span>
          <span class="rechargePlanList__price">
            NT$ {{ plan.price.toLocaleString() }}
          </span>
        </div>

        <p class="rechargePlanList__coins">
          金幣 {{ plan.goldCoins.toLocaleString() }}
          <span v-if="plan.bonusCoins > 0">
            ＋ 紅利 {{ plan.bonusCoins.toLocaleString() }}
          </span>
        </p>

        <p v-if="plan.description" class="rechargePlanList__desc">
          {{ plan.description }}
        </p>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RechargePlan } from '@/composables/useRechargePlans';

defineProps<{
  plans: RechargePlan[];
  selectedId: string;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'select', plan: RechargePlan): void;
}>();
</script>

<style scoped lang="scss">
.rechargePlanList {
  &__empty {
    opacity: 0.7;
    font-size: 13px;
    padding: 8px 0;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;

    @media (max-width: 640px) {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }
  }

  &__item {
    position: relative;
    border: 1px solid rgba(0, 0, 0, 0.12);
    background: #fff;
    border-radius: 12px;
    padding: 12px 10px;
    cursor: pointer;
    text-align: left;

    &--active {
      border-color: rgba(0, 0, 0, 0.45);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      transform: translateY(-1px);
    }

    &--hot {
      border-color: #e67e22;
    }
  }

  &__hotBadge {
    position: absolute;
    top: -1px;
    right: 8px;
    background: #e67e22;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 0 0 6px 6px;
  }

  &__top {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
  }

  &__name {
    font-weight: 800;
    font-size: 15px;
  }

  &__price {
    font-weight: 900;
    font-size: 15px;
  }

  &__coins {
    margin: 6px 0 0;
    font-size: 13px;
    color: #b8860b;
    font-weight: 600;
  }

  &__desc {
    margin: 4px 0 0;
    font-size: 12px;
    opacity: 0.7;
    line-height: 1.4;
  }
}
</style>
