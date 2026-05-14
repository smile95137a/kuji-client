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

    <div class="deposit__card">
      <p class="deposit__section-title">選擇付款方式</p>
      <div class="deposit__paymentList">
        <label class="deposit__paymentItem" :class="{ 'is-active': selectedPaymentMethod === 'CREDIT_CARD' }">
          <input v-model="selectedPaymentMethod" type="radio" value="CREDIT_CARD" />
          <span class="deposit__paymentTitle">信用卡</span>
          <span class="deposit__paymentDesc">立即付款，完成後回到儲值結果頁</span>
        </label>
        <label class="deposit__paymentItem" :class="{ 'is-active': selectedPaymentMethod === 'BANK_TRANSFER' }">
          <input v-model="selectedPaymentMethod" type="radio" value="BANK_TRANSFER" />
          <span class="deposit__paymentTitle">銀行轉帳</span>
          <span class="deposit__paymentDesc">取得虛擬帳號後再轉帳，系統入帳後更新餘額</span>
        </label>
      </div>
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
      :payment-method-label="paymentMethodLabel"
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
import { submitGatewayForm } from '@/utils/payment/submitGatewayForm';
import { ichibanInfoDialog } from '@/utils/dialog/ichibanInfoDialog';
import { useOverlayStore } from '@/stores/overlay';
import type { PaymentMethodCode } from '@/services/rechargeService';

import type { RechargePlan } from '@/composables/useRechargePlans';

const overlay = useOverlayStore();
const { refresh } = useWallet();
const {
  plans,
  isLoading,
  isSubmitting,
  error,
  paymentUrl,
  gatewayPayload,
  fetchPlans,
  createRecharge,
} = useRechargePlans();

const selectedPlanId = ref('');
const selectedPaymentMethod = ref<PaymentMethodCode>('CREDIT_CARD');
const confirmOpen = ref(false);
const planError = ref('');

const selectedPlan = computed<RechargePlan | null>(
  () => plans.value.find((p) => p.id === selectedPlanId.value) ?? null,
);

const paymentMethodLabel = computed(() =>
  selectedPaymentMethod.value === 'BANK_TRANSFER' ? '銀行轉帳（虛擬帳號）' : '信用卡',
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
  const result = await createRecharge(selectedPlanId.value, selectedPaymentMethod.value);

  if (result.success) {
    if (gatewayPayload.value && submitGatewayForm(gatewayPayload.value)) {
      return;
    }

    {
      overlay.open();
      await ichibanInfoDialog({
        title: '建立付款失敗',
        content: '未取得付款連結，請稍後再試。',
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

  &__paymentList {
    display: grid;
    gap: 12px;
  }

  &__paymentItem {
    display: grid;
    grid-template-columns: 20px 1fr;
    gap: 6px 12px;
    padding: 14px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    cursor: pointer;

    input {
      margin-top: 2px;
    }

    &.is-active {
      border-color: #111;
      box-shadow: 0 0 0 1px rgba(17, 17, 17, 0.2);
    }
  }

  &__paymentTitle {
    font-weight: 700;
  }

  &__paymentDesc {
    grid-column: 2;
    font-size: 13px;
    opacity: 0.7;
  }
}
</style>
