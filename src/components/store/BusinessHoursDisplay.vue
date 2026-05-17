<template>
  <section class="bizHours">
    <div class="bizHours__header">
      <div>
        <h3 class="bizHours__title">完整營業時間</h3>
        <p v-if="summaryText" class="bizHours__summary">{{ summaryText }}</p>
      </div>

      <button
        v-if="hasParsedHours"
        type="button"
        class="bizHours__toggle"
        @click="expanded = !expanded"
      >
        {{ expanded ? '收合' : '展開' }}
      </button>
    </div>

    <div v-if="todayRow" class="bizHours__today">
      <span class="bizHours__todayLabel">今日</span>
      <strong class="bizHours__todayValue">
        {{ todayRow.isClosed ? '公休' : `${todayRow.open} - ${todayRow.close}` }}
      </strong>
    </div>

    <div v-if="hasParsedHours && expanded" class="bizHours__table">
      <div
        v-for="(row, idx) in weekRows"
        :key="row.key"
        class="bizHours__row"
        :class="{ 'bizHours__row--today': idx === todayIndex }"
      >
        <span class="bizHours__day">{{ row.label }}</span>
        <span class="bizHours__time" :class="{ 'bizHours__time--closed': row.isClosed }">
          {{ row.isClosed ? '公休' : `${row.open} - ${row.close}` }}
        </span>
      </div>
    </div>

    <p v-else-if="!hasParsedHours" class="bizHours__fallback">{{ fallbackText }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { StoreBusinessHours } from '@/services/storeService';
import {
  formatBusinessHoursSummary,
  getTodayBusinessHoursRow,
  toBusinessHoursRows,
} from '@/utils/businessHours';

const props = defineProps<{
  businessHours?: StoreBusinessHours;
}>();

const expanded = ref(true);

const todayIndex = computed(() => {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
});

const weekRows = computed(() => toBusinessHoursRows(props.businessHours ?? null));
const todayRow = computed(() => getTodayBusinessHoursRow(props.businessHours ?? null));
const hasParsedHours = computed(() => weekRows.value.length > 0);
const summaryText = computed(() => formatBusinessHoursSummary(props.businessHours ?? null));

const fallbackText = computed(() => {
  if (typeof props.businessHours === 'string' && props.businessHours.trim()) {
    return `營業時間：${props.businessHours}`;
  }

  return '營業時間：暫無資料';
});
</script>

<style scoped lang="scss">
.bizHours {
  padding: 1.25rem;
  border: 1px solid rgba(92, 57, 39, 0.12);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.92);

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  &__title {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 800;
    color: #201714;
  }

  &__summary {
    margin: 0.35rem 0 0;
    color: #6c5b55;
    font-size: 0.9rem;
  }

  &__toggle {
    flex: 0 0 auto;
    border: 0;
    border-radius: 999px;
    padding: 0.48rem 0.85rem;
    background: rgba(180, 68, 43, 0.08);
    color: #b4442b;
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
  }

  &__today {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.9rem;
    padding: 0.9rem 1rem;
    border-radius: 0.9rem;
    background: #fff5f1;
  }

  &__todayLabel {
    color: #8b4a37;
    font-size: 0.85rem;
    font-weight: 700;
  }

  &__todayValue {
    color: #201714;
    font-size: 0.95rem;
    font-weight: 800;
  }

  &__table {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 0.8rem 1rem;
    border-radius: 0.85rem;
    background: #fff;
    border: 1px solid rgba(92, 57, 39, 0.08);

    &--today {
      border-color: rgba(180, 68, 43, 0.28);
      background: rgba(180, 68, 43, 0.04);
    }
  }

  &__day {
    color: #42312b;
    font-size: 0.92rem;
    font-weight: 700;
  }

  &__time {
    color: #201714;
    font-size: 0.92rem;

    &--closed {
      color: #b42318;
      font-weight: 700;
    }
  }

  &__fallback {
    margin: 0;
    color: #6c5b55;
    font-size: 0.92rem;
  }
}
</style>
