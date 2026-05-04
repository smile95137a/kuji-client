// src/composables/useWallet.ts
import { ref } from 'vue';
import { useMemberWalletStore } from '@/stores/memberWallet';

export function useWallet() {
  const memberWallet = useMemberWalletStore();
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function refresh() {
    isLoading.value = true;
    error.value = null;
    try {
      await memberWallet.loadMe();
    } catch (e: any) {
      error.value = e?.message ?? '載入錢包失敗';
    } finally {
      isLoading.value = false;
    }
  }

  return { isLoading, error, wallet: memberWallet.wallet, refresh };
}
