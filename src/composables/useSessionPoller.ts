// src/composables/useSessionPoller.ts
import { ref, onUnmounted } from 'vue';
import {
  getLotterySession,
  type SessionResponse,
} from '@/services/lotteryDrawService';

const POLL_INTERVAL_MS = 3000;

export function useSessionPoller(lotteryId: string | { value: string }) {
  const session = ref<SessionResponse | null>(null);
  const isPolling = ref(false);
  let interval: ReturnType<typeof setInterval> | null = null;

  const resolveId = () =>
    typeof lotteryId === 'string' ? lotteryId : lotteryId.value;

  function stopPolling() {
    if (interval !== null) {
      clearInterval(interval);
      interval = null;
    }
    isPolling.value = false;
  }

  function startPolling(onDesignationComplete: () => void) {
    stopPolling();
    isPolling.value = true;

    interval = setInterval(async () => {
      try {
        const res = await getLotterySession(resolveId());
        if (res?.success && res.data) {
          session.value = res.data;
          if (res.data.isDesignationComplete) {
            stopPolling();
            onDesignationComplete();
          }
        }
      } catch {
        // Silently ignore polling errors; will retry on next tick
      }
    }, POLL_INTERVAL_MS);
  }

  onUnmounted(() => stopPolling());

  return { session, isPolling, startPolling, stopPolling };
}
