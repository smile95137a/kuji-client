// src/composables/useProtectionTimer.ts
import { ref, computed, onUnmounted } from 'vue';

export function useProtectionTimer() {
  const remainingSeconds = ref(0);
  let interval: ReturnType<typeof setInterval> | null = null;

  function stop() {
    if (interval !== null) {
      clearInterval(interval);
      interval = null;
    }
  }

  function start(protectionEndTimeIso: string) {
    stop();
    const endMs = new Date(protectionEndTimeIso).getTime();
    remainingSeconds.value = Math.max(
      0,
      Math.floor((endMs - Date.now()) / 1000),
    );

    if (remainingSeconds.value <= 0) return;

    interval = setInterval(() => {
      remainingSeconds.value = Math.max(0, remainingSeconds.value - 1);
      if (remainingSeconds.value <= 0) stop();
    }, 1000);
  }

  onUnmounted(() => stop());

  const displayTime = computed(() => {
    const m = Math.floor(remainingSeconds.value / 60)
      .toString()
      .padStart(2, '0');
    const s = (remainingSeconds.value % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  });

  const isExpired = computed(() => remainingSeconds.value <= 0);

  return { remainingSeconds, displayTime, isExpired, start, stop };
}
