<template>
  <p class="ichibanDetail__status-summary">剩餘抽數：{{ remainingText }}</p>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type TicketStatus = 'AVAILABLE' | 'DRAWN' | 'RESERVED' | 'LOCKED' | string;

type TicketItem = {
  ticketNumber: number;
  status: TicketStatus;
};

const props = defineProps<{
  /** 後端若有回：remainingPrizes/totalPrizes 優先用 */
  remainingPrizes?: number | null;
  totalPrizes?: number | null;

  /** fallback：用 tickets 算 */
  tickets?: TicketItem[] | null;
}>();

const availableCountFromTickets = computed(() => {
  const arr = Array.isArray(props.tickets) ? props.tickets : [];
  return arr.filter(
    (t) => String(t?.status ?? '').toUpperCase() === 'AVAILABLE',
  ).length;
});

const totalCountFromTickets = computed(() => {
  const arr = Array.isArray(props.tickets) ? props.tickets : [];
  return arr.length;
});

const resolvedRemaining = computed(() => {
  const n = Number(props.remainingPrizes ?? NaN);
  if (!Number.isNaN(n)) return n;
  return availableCountFromTickets.value;
});

const resolvedTotal = computed(() => {
  const n = Number(props.totalPrizes ?? NaN);
  if (!Number.isNaN(n) && n > 0) return n;
  return totalCountFromTickets.value;
});

const remainingText = computed(() => {
  const r = Math.max(0, Number(resolvedRemaining.value || 0));
  const t = Math.max(0, Number(resolvedTotal.value || 0));
  if (!t) return String(r);
  return `${r}/${t}`;
});
</script>
