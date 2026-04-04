<template>
  <section class="bizHours">
    <h3 class="bizHours__title">營業時間</h3>

    <div v-if="hasParsedHours" class="bizHours__table">
      <div
        v-for="(row, idx) in weekRows"
        :key="row.key"
        class="bizHours__row"
        :class="{ 'bizHours__row--today': idx === todayIndex }"
      >
        <span class="bizHours__day">{{ row.label }}</span>
        <span class="bizHours__time" :class="{ 'bizHours__time--closed': row.isClosed }">
          {{ row.isClosed ? '休息' : `${row.open} – ${row.close}` }}
        </span>
      </div>
    </div>

    <p v-else class="bizHours__fallback">營業時間：請洽店家</p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type DayHours = { open: string; close: string; isClosed: boolean };

const props = defineProps<{
  businessHours?: Record<string, DayHours> | null;
}>();

const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS: Record<string, string> = {
  monday: '週一',
  tuesday: '週二',
  wednesday: '週三',
  thursday: '週四',
  friday: '週五',
  saturday: '週六',
  sunday: '週日',
};

// 0=Sunday … 6=Saturday → map to our index (0=Monday … 6=Sunday)
const todayIndex = computed(() => {
  const d = new Date().getDay(); // 0=Sun, 1=Mon, …, 6=Sat
  return d === 0 ? 6 : d - 1;
});

const weekRows = computed(() =>
  DAY_KEYS.map((key) => {
    const h = props.businessHours?.[key];
    return {
      key,
      label: DAY_LABELS[key],
      isClosed: h?.isClosed ?? true,
      open: h?.open ?? '',
      close: h?.close ?? '',
    };
  }),
);

const hasParsedHours = computed(
  () =>
    !!props.businessHours &&
    typeof props.businessHours === 'object' &&
    Object.keys(props.businessHours).length > 0,
);
</script>

<style scoped lang="scss">
.bizHours {
  &__title {
    font-size: 1.1rem;
    font-weight: 800;
    margin: 0 0 12px;
    color: #111;
    border-left: 4px solid #b2473a;
    padding-left: 12px;
  }

  &__table {
    display: flex;
    flex-direction: column;
    gap: 4px;
    border: 1.5px solid #eee;
    border-radius: 10px;
    overflow: hidden;
  }

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    font-size: 0.9rem;
    background: #fff;
    transition: background 0.15s;

    &--today {
      background: #fff5f4;
      font-weight: 700;
    }
  }

  &__day {
    color: #333;
    min-width: 40px;
  }

  &__time {
    color: #222;

    &--closed {
      color: #e53e3e;
      font-weight: 600;
    }
  }

  &__fallback {
    font-size: 0.9rem;
    color: #888;
    margin: 0;
  }
}
</style>
