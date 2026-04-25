// src/composables/useRechargePlans.ts
import { ref } from 'vue';
import { getActiveRechargePlans } from '@/services/rechargePlanService';
import { createRechargeRequest } from '@/services/rechargeService';
import { useMemberWalletStore } from '@/stores/memberWallet';

export interface RechargePlan {
  id: string;
  name: string;
  price: number;
  goldCoins: number;
  bonusCoins: number;
  isHot: boolean;
  description: string | null;
  isActive: boolean;
}

function normalizePlan(x: any): RechargePlan {
  return {
    id: String(x.id ?? ''),
    name: x.name ?? x.title ?? `方案 ${x.id}`,
    price: Number(x.price ?? x.amount ?? x.rechargeAmount ?? 0),
    goldCoins: Number(x.goldCoins ?? x.goldAmount ?? x.gold ?? 0),
    bonusCoins: Number(x.bonusCoins ?? x.bonusAmount ?? x.bonusGold ?? x.giftGold ?? 0),
    isHot: x.isHot === true,
    description: x.description ?? null,
    isActive: x.isActive !== false,
  };
}

export function useRechargePlans() {
  const memberWallet = useMemberWalletStore();

  const plans = ref<RechargePlan[]>([]);
  const isLoading = ref(false);
  const isSubmitting = ref(false);
  const error = ref<string | null>(null);
  const paymentUrl = ref<string | null>(null);
  const lastSuccessful = ref(false);

  async function fetchPlans() {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await getActiveRechargePlans();
      if (res?.success) {
        const raw = res.data as any;
        const list: any[] = Array.isArray(raw)
          ? raw
          : (raw?.content ?? raw?.list ?? []);
        plans.value = list.map(normalizePlan).filter((p) => p.isActive);
      }
    } catch (e: any) {
      error.value = e?.message ?? '載入方案失敗';
    } finally {
      isLoading.value = false;
    }
  }

  async function createRecharge(planId: string): Promise<{ success: boolean; message?: string }> {
    isSubmitting.value = true;
    lastSuccessful.value = false;
    paymentUrl.value = null;
    error.value = null;

    try {
      const res = await createRechargeRequest({ planId, paymentMethod: 'GOMYPAY' });

      if (res?.success) {
        const data = res.data as any;
        paymentUrl.value = data?.paymentUrl ?? null;
        lastSuccessful.value = true;

        // Refresh wallet balance after successful recharge
        await memberWallet.loadMe();

        return { success: true };
      } else {
        const msg = res?.message || '儲值失敗，請稍後再試';
        error.value = msg;
        return { success: false, message: msg };
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? '儲值失敗，請稍後再試';
      error.value = msg;
      return { success: false, message: msg };
    } finally {
      isSubmitting.value = false;
    }
  }

  return {
    plans,
    isLoading,
    isSubmitting,
    error,
    paymentUrl,
    lastSuccessful,
    fetchPlans,
    createRecharge,
  };
}
