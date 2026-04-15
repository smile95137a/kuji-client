<!-- src/components/ichiban/ProtectionTimer.vue -->
<script setup lang="ts">
import { watch } from 'vue';
import { useProtectionTimer } from '@/composables/useProtectionTimer';

const props = defineProps<{
  /** ISO 8601 保護期結束時間；null 代表無保護期 */
  protectionEndTime: string | null;
  /** 可選自訂說明文字 */
  message?: string;
}>();

const emit = defineEmits<{
  /** 倒數歸零（保護期結束） */
  (e: 'expired'): void;
}>();

const { displayTime, isExpired, start, stop } = useProtectionTimer();

watch(
  () => props.protectionEndTime,
  (val) => {
    if (val) start(val);
    else stop();
  },
  { immediate: true },
);

watch(isExpired, (val) => {
  if (val && props.protectionEndTime) emit('expired');
});
</script>

<template>
  <div
    v-if="protectionEndTime && !isExpired"
    class="protection-timer"
    role="timer"
    :aria-label="`保護期剩餘 ${displayTime}`"
  >
    <span class="protection-timer__icon" aria-hidden="true">⏱</span>
    <span class="protection-timer__label">
      {{ message ?? '開套者保護期倒數' }}
    </span>
    <span class="protection-timer__time">{{ displayTime }}</span>
  </div>
</template>
