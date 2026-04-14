// src/composables/useReferral.ts
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { useMemberWalletStore } from '@/stores/memberWallet';
import {
  generateMyCode,
  getMyStats,
  applyCode as applyCodeApi,
  type ReferralCodeRes,
  type ReferralStatsRes,
} from '@/services/referralService';

export function useReferral() {
  const authStore = useAuthStore();
  const walletStore = useMemberWalletStore();

  const myCode = ref<ReferralCodeRes | null>(null);
  const stats = ref<ReferralStatsRes | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /** Google 登入 且 尚未套用推薦碼 → 可補綁 */
  const canApplyReferral = computed(
    () =>
      authStore.user?.provider === 'GOOGLE' &&
      (authStore.user?.referralCode == null || authStore.user?.referralCode === ''),
  );

  async function generateCode(): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      myCode.value = await generateMyCode();
    } catch (e: any) {
      error.value = '產生推薦碼失敗';
    } finally {
      isLoading.value = false;
    }
  }

  async function loadStats(): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      stats.value = await getMyStats();
    } catch (e: any) {
      error.value = '取得推薦統計失敗';
    } finally {
      isLoading.value = false;
    }
  }

  async function applyCode(code: string): Promise<boolean> {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await applyCodeApi(code);
      if (res.success) {
        // Sync user referralCode so canApplyReferral hides immediately
        if (authStore.user) {
          authStore.user = { ...authStore.user, referralCode: code };
        }
        // Sync wallet bonus balance
        await walletStore.loadMe();
        return true;
      }
      return false;
    } catch (e: any) {
      const reason = e?.response?.data?.error?.message ?? '套用推薦碼失敗';
      error.value = reason;
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    myCode,
    stats,
    isLoading,
    error,
    canApplyReferral,
    generateCode,
    loadStats,
    applyCode,
  };
}
