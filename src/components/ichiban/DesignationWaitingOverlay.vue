<script setup lang="ts">
import { watch } from 'vue';
import KujiButton from '@/components/common/KujiButton.vue';
import { useProtectionTimer } from '@/composables/useProtectionTimer';
import { useSessionPoller } from '@/composables/useSessionPoller';

const props = defineProps<{
  show: boolean;
  /** ISO-8601 countdown target; empty string = no deadline */
  openerDeadline: string;
  message: string;
  /** Lottery ID used for session polling */
  lotteryId?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'expired'): void;
  /** Emitted when the opener completes designation (detected via polling) */
  (e: 'designationComplete'): void;
}>();

// Countdown timer for the opener's deadline
const { displayTime, isExpired, start: startCountdown, stop: stopCountdown } =
  useProtectionTimer();

watch(isExpired, (val) => {
  if (val && props.show) emit('expired');
});

// Session poller: 3-second interval, stops when isDesignationComplete = true
const { startPolling, stopPolling } = useSessionPoller(
  { get value() { return props.lotteryId ?? ''; } },
);

watch(
  () => props.show,
  (val) => {
    if (val) {
      if (props.openerDeadline) startCountdown(props.openerDeadline);
      if (props.lotteryId) {
        startPolling(() => emit('designationComplete'));
      }
    } else {
      stopCountdown();
      stopPolling();
    }
  },
  { immediate: true },
);
</script>

<template>
  <div v-if="show" class="designation-waiting-overlay">
    <div class="designation-waiting-overlay__backdrop" />
    <div class="designation-waiting-overlay__card">
      <div class="designation-waiting-overlay__icon">
        <font-awesome-icon :icon="['fas', 'clock']" />
      </div>
      <h2 class="designation-waiting-overlay__title">等待開套者指定大獎號碼</h2>
      <div class="designation-waiting-overlay__timer">{{ displayTime }}</div>
      <p class="designation-waiting-overlay__message">{{ message }}</p>
      <KujiButton variant="secondary" @click="emit('close')">稍後再試</KujiButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
.designation-waiting-overlay {
  position: fixed;
  inset: 0;
  z-index: 8000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.designation-waiting-overlay__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
}

.designation-waiting-overlay__card {
  position: relative;
  background: #1a1a2e;
  border-radius: 16px;
  padding: 32px 24px;
  max-width: 360px;
  width: 90%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.designation-waiting-overlay__icon {
  font-size: 2rem;
  color: #ffcc00;
}

.designation-waiting-overlay__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.designation-waiting-overlay__timer {
  font-family: monospace;
  font-size: 3rem;
  color: #ffcc00;
  letter-spacing: 0.05em;
}

.designation-waiting-overlay__message {
  font-size: 0.9rem;
  color: #cccccc;
  margin: 0;
}
</style>
