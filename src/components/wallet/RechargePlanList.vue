<!-- src/components/wallet/RechargePlanList.vue -->
<template>
  <div class="rechargePlanList">
    <div v-if="loading" class="rechargePlanList__state">
      <span class="rechargePlanList__stateIcon">
        <font-awesome-icon :icon="['fas', 'spinner']" spin />
      </span>
      <p>載入方案中…</p>
    </div>

    <div v-else-if="plans.length === 0" class="rechargePlanList__state">
      <span class="rechargePlanList__stateIcon">
        <font-awesome-icon :icon="['fas', 'box-open']" />
      </span>
      <p>目前沒有可用方案</p>
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
        <span v-if="plan.isHot" class="rechargePlanList__hotBadge">
          <font-awesome-icon :icon="['fas', 'fire']" />
          熱門
        </span>

        <span v-if="selectedId === plan.id" class="rechargePlanList__check">
          <font-awesome-icon :icon="['fas', 'check']" />
        </span>

        <div class="rechargePlanList__top">
          <div>
            <p class="rechargePlanList__name">{{ plan.name }}</p>
            <p class="rechargePlanList__price">
              NT$ {{ plan.price.toLocaleString() }}
            </p>
          </div>

          <span class="rechargePlanList__icon">
            <font-awesome-icon :icon="['fas', 'coins']" />
          </span>
        </div>

        <div class="rechargePlanList__coinBox">
          <p class="rechargePlanList__coinRow">
            <span>獲得金幣</span>
            <strong>{{ plan.goldCoins.toLocaleString() }}</strong>
          </p>

          <p v-if="plan.bonusCoins > 0" class="rechargePlanList__coinRow">
            <span>贈送紅利</span>
            <strong class="rechargePlanList__bonus">
              {{ plan.bonusCoins.toLocaleString() }}
            </strong>
          </p>
        </div>

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
  --primary: #b43325;
  --primary-soft: rgba(180, 51, 37, 0.1);
  --brown: #3f2412;
  --cream: #fff8ef;
  --line: rgba(63, 36, 18, 0.1);
  --text: #201713;
  --text-soft: rgba(32, 23, 19, 0.58);

  &__state {
    min-height: 140px;
    padding: 22px;
    border-radius: 20px;

    display: grid;
    place-items: center;
    text-align: center;

    background: var(--cream);
    border: 1px dashed rgba(180, 51, 37, 0.22);
    color: var(--text-soft);

    p {
      margin: 8px 0 0;
      color: var(--text);
      font-size: 14px;
      font-weight: 900;
    }
  }

  &__stateIcon {
    width: 44px;
    height: 44px;
    border-radius: 16px;

    display: grid;
    place-items: center;

    background: #fff;
    color: var(--primary);
    box-shadow: 0 8px 16px rgba(63, 36, 18, 0.06);

    font-size: 18px;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  &__item {
    position: relative;
    min-height: 186px;
    padding: 16px;
    border-radius: 22px;
    cursor: pointer;
    overflow: hidden;

    display: flex;
    flex-direction: column;
    gap: 12px;

    background: linear-gradient(180deg, #fffaf4 0%, #ffffff 100%);
    border: 1px solid var(--line);
    color: var(--text);
    text-align: left;
    box-shadow: 0 10px 20px rgba(63, 36, 18, 0.045);

    transition:
      transform 0.16s ease,
      border-color 0.16s ease,
      box-shadow 0.16s ease,
      background 0.16s ease;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(
        circle at 100% 0%,
        rgba(180, 51, 37, 0.1),
        transparent 30%
      );
      opacity: 0;
      transition: opacity 0.16s ease;
      pointer-events: none;
    }

    &:hover {
      transform: translateY(-2px);
      border-color: rgba(180, 51, 37, 0.22);
      box-shadow: 0 14px 26px rgba(67, 30, 14, 0.08);

      &::before {
        opacity: 1;
      }
    }

    &--active {
      border-color: rgba(180, 51, 37, 0.55);
      box-shadow:
        0 0 0 4px rgba(180, 51, 37, 0.1),
        0 16px 30px rgba(67, 30, 14, 0.1);
      transform: translateY(-2px);
    }

    &--hot {
      border-color: rgba(245, 158, 11, 0.32);
    }
  }

  &__hotBadge {
    position: absolute;
    top: 0;
    right: 16px;
    min-height: 28px;
    padding: 0 10px;
    border-radius: 0 0 12px 12px;

    display: inline-flex;
    align-items: center;
    gap: 5px;

    background: linear-gradient(135deg, #f59e0b 0%, #d66b42 100%);
    color: #fff;

    font-size: 12px;
    font-weight: 950;
    box-shadow: 0 8px 14px rgba(245, 158, 11, 0.18);
  }

  &__check {
    position: absolute;
    right: 12px;
    bottom: 12px;

    width: 28px;
    height: 28px;
    border-radius: 999px;

    display: grid;
    place-items: center;

    background: var(--primary);
    color: #fff;

    font-size: 12px;
    box-shadow: 0 8px 16px rgba(180, 51, 37, 0.22);
  }

  &__top {
    position: relative;
    z-index: 1;

    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: flex-start;
  }

  &__name {
    margin: 0;
    color: var(--text);
    font-size: 16px;
    line-height: 1.35;
    font-weight: 950;
  }

  &__price {
    margin: 7px 0 0;
    color: var(--primary);
    font-size: 22px;
    line-height: 1.1;
    font-weight: 950;
  }

  &__icon {
    width: 42px;
    height: 42px;
    border-radius: 15px;

    display: grid;
    place-items: center;
    flex: 0 0 auto;

    background: #fff;
    color: var(--primary);
    box-shadow: 0 8px 16px rgba(63, 36, 18, 0.06);

    font-size: 17px;
  }

  &__coinBox {
    position: relative;
    z-index: 1;

    display: grid;
    gap: 7px;
    padding: 12px;
    border-radius: 16px;

    background: #fff;
    border: 1px solid var(--line);
  }

  &__coinRow {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;

    margin: 0;

    span {
      color: var(--text-soft);
      font-size: 12px;
      font-weight: 900;
    }

    strong {
      color: var(--brown);
      font-size: 14px;
      font-weight: 950;
    }
  }

  &__bonus {
    color: var(--primary) !important;
  }

  &__desc {
    position: relative;
    z-index: 1;

    margin: 0;
    color: var(--text-soft);
    font-size: 12px;
    line-height: 1.5;
    font-weight: 700;
  }

  @media (max-width: 900px) {
    &__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    &__grid {
      grid-template-columns: 1fr;
      gap: 10px;
    }

    &__item {
      min-height: unset;
      padding: 15px;
      border-radius: 20px;
    }

    &__price {
      font-size: 21px;
    }

    &__coinBox {
      padding: 11px;
    }

    &__hotBadge {
      right: 14px;
    }
  }
}
</style>
