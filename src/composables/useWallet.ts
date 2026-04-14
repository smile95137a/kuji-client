// src/composables/useWallet.ts
import { ref } from 'vue';
import { useMemberWalletStore } from '@/stores/memberWallet';
import { getMyWallet } from '@/services/walletService';

export function useWallet() {
  const memberWallet = useMemberWalletStore();
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function refresh() {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await getMyWallet();
      if (res?.success && res.data) {
        // Patch the store with wallet data from /wallet endpoint
        const walletData = res.data as any;
        memberWallet.setMe({
          ...(memberWallet.me || {}),
          goldCoins: walletData.goldBalance ?? walletData.goldCoins ?? 0,
          bonusCoins: walletData.bonusBalance ?? walletData.bonusCoins ?? 0,
        });
      }
    } catch (e: any) {
      // Fallback to userService if wallet endpoint fails
      try {
        await memberWallet.loadMe();
      } catch {
        error.value = e?.message ?? '載入錢包失敗';
      }
    } finally {
      isLoading.value = false;
    }
  }

  return { isLoading, error, wallet: memberWallet.wallet, refresh };
}
