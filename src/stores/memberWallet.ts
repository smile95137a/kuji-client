// src/stores/memberWallet.ts
import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { getMe } from '@/services/userService';
import { executeApi } from '@/utils/executeApiUtils';

export const useMemberWalletStore = defineStore('memberWallet', () => {
  const me = ref<any>(null);

  /** 只用兩個：goldCoins / bonusCoins */
  const wallet = computed(() => {
    const u = me.value || {};
    return {
      goldCoins: Number(u.goldCoins ?? 0) || 0,
      bonusCoins: Number(u.bonusCoins ?? 0) || 0,
    };
  });

  const formatNumber = (n: number) => {
    try {
      return new Intl.NumberFormat('zh-TW').format(n || 0);
    } catch {
      return String(n || 0);
    }
  };

  /** 載入我的資料（含錢包） */
  const loadMe = async () => {
    await executeApi<any>({
      fn: () => getMe(),
      onSuccess: (data) => {
        // executeApi 的 onSuccess 拿到的是 res.data
        // 這邊支援：data / data.data / data.data.data（你專案可能混用）
        me.value =
          (data as any)?.data?.data ?? (data as any)?.data ?? data ?? null;
      },
    });
  };

  /** 直接更新（例如儲值成功後你想手動 patch） */
  const setMe = (next: any) => {
    me.value = next ?? null;
  };

  /** 只更新 coins（不動其他欄位） */
  const patchCoins = (goldDelta = 0, bonusDelta = 0) => {
    const u = me.value || {};
    const nextGold = (Number(u.goldCoins ?? 0) || 0) + (Number(goldDelta) || 0);
    const nextBonus =
      (Number(u.bonusCoins ?? 0) || 0) + (Number(bonusDelta) || 0);

    me.value = {
      ...u,
      goldCoins: nextGold,
      bonusCoins: nextBonus,
    };
  };

  return {
    me,
    wallet,
    formatNumber,
    loadMe,
    setMe,
    patchCoins,
  };
});
