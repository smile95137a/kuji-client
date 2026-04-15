<!-- src/views/member/Deposit.vue -->
<template>
  <section class="deposit">
    <header class="deposit__header">
      <h1 class="deposit__title">儲值</h1>
      <p class="deposit__subtitle">選擇儲值方案並完成付款</p>
    </header>

    <!-- 餘額卡片 -->
    <WalletBalanceCard hint="儲值完成後會立即更新至錢包" />

    <!-- 方案選擇 -->
    <div class="deposit__card">
      <p class="deposit__section-title">選擇儲值方案</p>
      <RechargePlanList
        :plans="plans"
        :selected-id="selectedPlanId"
        :loading="isLoading"
        @select="onSelectPlan"
      />
      <p v-if="planError" class="deposit__error">{{ planError }}</p>
    </div>

    <!-- 確認按鈕 -->
    <div class="deposit__footer">
      <button
        class="deposit__submit"
        type="button"
        :disabled="!selectedPlanId || isSubmitting"
        @click="openConfirm"
      >
        {{ isSubmitting ? '處理中…' : '確認儲值' }}
      </button>
      <p class="deposit__tip">點擊「確認儲值」代表你同意付款條款與相關規範</p>
    </div>

    <!-- 確認 Dialog -->
    <RechargeConfirmDialog
      :visible="confirmOpen"
      :plan="selectedPlan"
      :submitting="isSubmitting"
      @confirm="onConfirm"
      @cancel="confirmOpen = false"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import WalletBalanceCard from '@/components/wallet/WalletBalanceCard.vue';
import RechargePlanList from '@/components/wallet/RechargePlanList.vue';
import RechargeConfirmDialog from '@/components/wallet/RechargeConfirmDialog.vue';

import { useRechargePlans } from '@/composables/useRechargePlans';
import { useWallet } from '@/composables/useWallet';
import { ichibanInfoDialog } from '@/utils/dialog/ichibanInfoDialog';
import { useOverlayStore } from '@/stores/overlay';

import type { RechargePlan } from '@/composables/useRechargePlans';

const overlay = useOverlayStore();
const { refresh } = useWallet();
const {
  plans,
  isLoading,
  isSubmitting,
  error,
  paymentUrl,
  fetchPlans,
  createRecharge,
} = useRechargePlans();

const selectedPlanId = ref('');
const confirmOpen = ref(false);
const planError = ref('');

const selectedPlan = computed<RechargePlan | null>(
  () => plans.value.find((p) => p.id === selectedPlanId.value) ?? null,
);

function onSelectPlan(plan: RechargePlan) {
  selectedPlanId.value = plan.id;
  planError.value = '';
}

function openConfirm() {
  if (!selectedPlanId.value) {
    planError.value = '請先選擇一個儲值方案';
    return;
  }
  confirmOpen.value = true;
}

async function onConfirm() {
  confirmOpen.value = false;
  const result = await createRecharge(selectedPlanId.value);

  if (result.success) {
    if (paymentUrl.value) {
      // Production: redirect to payment gateway
      window.location.href = paymentUrl.value;
    } else {
      // Test mode: coins credited directly
      await refresh();
      overlay.open();
      await ichibanInfoDialog({
        title: '儲值成功',
        content: '此為測試模式，儲值後金幣直接到帳，餘額已更新。',
      });
      overlay.close();
    }
  } else {
    overlay.open();
    await ichibanInfoDialog({
      title: '儲值失敗',
      content: error.value || result.message || '儲值未完成，請稍後再試或更換方案。',
    });
    overlay.close();
  }
}

onMounted(async () => {
  await Promise.all([refresh(), fetchPlans()]);
});
</script>

<style scoped lang="scss">
.deposit {
  max-width: 920px;
  margin: 0 auto;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__header {
    margin-bottom: 4px;
  }

  &__title {
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 6px;
  }

  &__subtitle {
    margin: 0;
    opacity: 0.7;
  }

  &__card {
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 14px;
    padding: 16px;
    background: #fff;
  }

  &__section-title {
    margin: 0 0 12px;
    font-weight: 700;
  }

  &__error {
    margin: 8px 0 0;
    color: #d11;
    font-size: 13px;
  }

  &__footer {
    padding-top: 4px;
  }

  &__submit {
    width: 100%;
    border: 0;
    border-radius: 12px;
    padding: 14px;
    font-size: 16px;
    font-weight: 800;
    cursor: pointer;
    background: #111;
    color: #fff;
    transition: opacity 0.15s;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__tip {
    margin: 10px 0 0;
    font-size: 12px;
    opacity: 0.7;
    text-align: center;
  }
}
</style>
