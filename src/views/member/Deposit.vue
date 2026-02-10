<template>
  <section class="deposit">
    <header class="deposit__header">
      <h1 class="deposit__title">儲值</h1>
      <p class="deposit__subtitle">選擇儲值方案並完成付款</p>
    </header>

    <!-- 餘額卡片 -->
    <div class="deposit__card">
      <div class="deposit__balance">
        <p class="deposit__balance-label">目前金幣餘額</p>
        <p class="deposit__balance-value">{{ goldCoins.toLocaleString() }}</p>
      </div>
      <div class="deposit__balance" style="margin-top: 8px;">
        <p class="deposit__balance-label">紅利餘額</p>
        <p class="deposit__balance-value" style="font-size: 18px; color: #9c27b0;">{{ bonusCoins.toLocaleString() }}</p>
      </div>
      <p class="deposit__hint">儲值完成後會立即更新至錢包</p>
    </div>

    <!-- 載入中 -->
    <div v-if="loadingPlans" class="deposit__card">
      <p style="text-align: center; padding: 20px; opacity: 0.7;">載入儲值方案中...</p>
    </div>

    <!-- 儲值方案列表 -->
    <div v-else class="deposit__card">
      <div class="deposit__section">
        <p class="deposit__section-title">選擇儲值方案</p>

        <div class="deposit__plan-grid">
          <div
            v-for="plan in rechargePlans"
            :key="plan.id"
            class="deposit__plan-card"
            :class="{ 'is-active': selectedPlanId === plan.id }"
            @click="selectPlan(plan)"
          >
            <div class="deposit__plan-badge" v-if="plan.bonus > 0">
              送 {{ plan.bonus }}
            </div>
            <p class="deposit__plan-amount">NT$ {{ plan.amount.toLocaleString() }}</p>
            <p class="deposit__plan-name">{{ plan.name }}</p>
            <p class="deposit__plan-desc" v-if="plan.description">{{ plan.description }}</p>
            <p class="deposit__plan-total">
              <span style="font-size: 12px; opacity: 0.7;">實得金幣：</span>
              <b>{{ plan.totalValue.toLocaleString() }}</b>
            </p>
          </div>
        </div>

        <p v-if="rechargePlans.length === 0" class="deposit__empty">
          目前沒有可用的儲值方案
        </p>
      </div>

      <!-- 付款方式 -->
      <div class="deposit__section" v-if="selectedPlanId">
        <p class="deposit__section-title">付款方式</p>

        <div class="deposit__pay-grid">
          <label
            class="deposit__pay-item"
            :class="{ 'is-active': paymentMethod === 'ECPAY' }"
          >
            <input
              class="deposit__radio"
              type="radio"
              value="ECPAY"
              v-model="paymentMethod"
            />
            <span class="deposit__pay-text">綠界支付</span>
          </label>

          <label
            class="deposit__pay-item"
            :class="{ 'is-active': paymentMethod === 'CREDIT_CARD' }"
          >
            <input
              class="deposit__radio"
              type="radio"
              value="CREDIT_CARD"
              v-model="paymentMethod"
            />
            <span class="deposit__pay-text">信用卡</span>
          </label>

          <label
            class="deposit__pay-item"
            :class="{ 'is-active': paymentMethod === 'OPAY' }"
          >
            <input
              class="deposit__radio"
              type="radio"
              value="OPAY"
              v-model="paymentMethod"
            />
            <span class="deposit__pay-text">歐付寶</span>
          </label>
        </div>
      </div>

      <!-- 確認區 -->
      <div class="deposit__footer" v-if="selectedPlanId">
        <div class="deposit__summary">
          <p class="deposit__summary-label">本次儲值</p>
          <p class="deposit__summary-value">
            NT$ {{ selectedPlan?.amount.toLocaleString() || 0 }}
          </p>
        </div>

        <div class="deposit__summary" v-if="selectedPlan && selectedPlan.bonus > 0">
          <p class="deposit__summary-label">贈送紅利</p>
          <p class="deposit__summary-value" style="color: #9c27b0;">
            + {{ selectedPlan.bonus.toLocaleString() }}
          </p>
        </div>

        <button 
          class="deposit__submit" 
          type="button"
          @click="onSubmit"
          :disabled="submitting"
        >
          {{ submitting ? '處理中...' : '確認儲值' }}
        </button>

        <p class="deposit__tip">點擊「確認儲值」代表你同意付款條款與相關規範</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { getActiveRechargePlans } from '@/services/rechargePlanService';
import { createRecharge } from '@/services/rechargeService';
import { getMyWallet } from '@/services/walletService';
import { executeApi } from '@/utils/executeApiUtils';
import { useOverlayStore } from '@/stores/overlay';
import { ichibanInfoDialog } from '@/utils/dialog/ichibanInfoDialog';
import { ichibanConfirmDialog } from '@/utils/dialog/ichibanConfirmDialog';

type PayMethod = 'ECPAY' | 'OPAY' | 'CREDIT_CARD';

type RechargePlan = {
  id: string;
  name: string;
  amount: number;
  bonus: number;
  totalValue: number;
  description?: string;
  status: string;
};

const overlay = useOverlayStore();

const goldCoins = ref(0);
const bonusCoins = ref(0);
const loadingPlans = ref(false);
const submitting = ref(false);
const rechargePlans = ref<RechargePlan[]>([]);
const selectedPlanId = ref<string>('');
const paymentMethod = ref<PayMethod>('ECPAY');

const selectedPlan = computed(() => 
  rechargePlans.value.find(p => p.id === selectedPlanId.value)
);

/** 載入錢包餘額 */
const loadWallet = async () => {
  try {
    const res = await getMyWallet();
    if (res.success && res.data) {
      goldCoins.value = Number(res.data.goldCoins ?? 0);
      bonusCoins.value = Number(res.data.bonusCoins ?? 0);
    }
  } catch (e) {
    console.error('Deposit - loadWallet error:', e);
  }
};

/** 載入儲值方案 */
const loadRechargePlans = async () => {
  loadingPlans.value = true;
  try {
    const res = await getActiveRechargePlans();
    if (res.success && Array.isArray(res.data)) {
      rechargePlans.value = res.data.map((p: any) => ({
        id: p.id || '',
        name: p.name || '',
        amount: Number(p.amount ?? 0),
        bonus: Number(p.bonus ?? 0),
        totalValue: Number(p.totalValue ?? p.amount ?? 0),
        description: p.description || '',
        status: p.status || 'ACTIVE',
      }));
    }
  } catch (e) {
    console.error('Deposit - loadRechargePlans error:', e);
  } finally {
    loadingPlans.value = false;
  }
};

onMounted(() => {
  loadWallet();
  loadRechargePlans();
});

/** 選擇方案 */
const selectPlan = (plan: RechargePlan) => {
  selectedPlanId.value = plan.id;
};

/** 提交儲值 */
const onSubmit = async () => {
  if (!selectedPlanId.value) {
    overlay.open();
    await ichibanInfoDialog({ title: '提示', content: '請選擇儲值方案' });
    overlay.close();
    return;
  }

  const plan = selectedPlan.value;
  if (!plan) return;

  // 確認對話框
  overlay.open();
  const confirmed = await ichibanConfirmDialog({
    title: '確認儲值',
    content: `即將儲值 NT$ ${plan.amount.toLocaleString()}${
      plan.bonus > 0 ? `（含贈送紅利 ${plan.bonus}）` : ''
    }，確定要繼續嗎？`,
    confirmText: '確認',
    cancelText: '取消',
  });
  overlay.close();

  if (!confirmed) return;

  submitting.value = true;

  await executeApi({
    fn: () => createRecharge({
      planId: selectedPlanId.value,
      paymentMethod: paymentMethod.value,
    }),
    successTitle: '儲值請求已建立',
    showSuccessDialog: false,
    showCatchDialog: true,
    onSuccess: async (data) => {
      // TODO: 跳轉至支付頁面
      // 實際應用中，後端應該返回支付 URL 或支付表單
      console.log('Recharge record created:', data);
      
      overlay.open();
      await ichibanInfoDialog({
        title: '請求已建立',
        content: `儲值記錄 ID: ${data.id}\n\n請前往支付頁面完成付款。`,
      });
      overlay.close();

      // Demo: 假設支付成功，重新載入餘額
      // 實際應用中應該導向支付網關，完成後再回調
      await loadWallet();
    },
  });

  submitting.value = false;
};
</script>

<style scoped lang="scss">
.deposit {
  max-width: 920px;
  margin: 0 auto;
  padding: 24px 16px;

  &__header {
    margin-bottom: 16px;
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
    margin-top: 12px;
  }

  &__balance {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
  }
  &__balance-label {
    margin: 0;
    opacity: 0.75;
  }
  &__balance-value {
    margin: 0;
    font-size: 22px;
    font-weight: 800;
  }
  &__hint {
    margin: 10px 0 0;
    opacity: 0.7;
    font-size: 13px;
  }

  &__section {
    margin-top: 8px;
  }
  &__section-title {
    margin: 0 0 10px;
    font-weight: 700;
  }

  &__plan-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;

    @media (max-width: 768px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    @media (max-width: 520px) {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }
  }

  &__plan-card {
    border: 2px solid rgba(0, 0, 0, 0.12);
    border-radius: 16px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    background: #fff;

    &:hover {
      border-color: rgba(0, 0, 0, 0.25);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    &.is-active {
      border-color: #f59e0b;
      border-width: 3px;
      background: #fffbeb;
    }
  }

  &__plan-badge {
    position: absolute;
    top: -8px;
    right: 12px;
    background: linear-gradient(135deg, #f59e0b, #f97316);
    color: #fff;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 900;
    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
  }

  &__plan-amount {
    margin: 0 0 6px;
    font-size: 28px;
    font-weight: 900;
    color: #111;
  }

  &__plan-name {
    margin: 0 0 4px;
    font-weight: 700;
    font-size: 15px;
  }

  &__plan-desc {
    margin: 0 0 8px;
    font-size: 13px;
    opacity: 0.7;
  }

  &__plan-total {
    margin: 8px 0 0;
    padding-top: 8px;
    border-top: 1px solid rgba(0, 0, 0, 0.08);
    font-size: 14px;

    b {
      color: #f59e0b;
      font-size: 16px;
    }
  }

  &__empty {
    text-align: center;
    padding: 40px 20px;
    opacity: 0.6;
  }

  &__amount-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;

    @media (max-width: 640px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  &__amount-btn {
    border: 1px solid rgba(0, 0, 0, 0.12);
    background: #fff;
    border-radius: 12px;
    padding: 12px 10px;
    cursor: pointer;
    font-weight: 700;

    &.is-active {
      border-color: rgba(0, 0, 0, 0.45);
      transform: translateY(-1px);
    }
  }

  &__field {
    margin-top: 12px;
  }
  &__label {
    display: block;
    font-size: 13px;
    opacity: 0.75;
    margin-bottom: 6px;
  }
  &__input {
    width: 100%;
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 12px;
    padding: 12px;
    outline: none;
  }

  &__pay-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;

    @media (max-width: 640px) {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }
  }
  &__pay-item {
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 12px;
    padding: 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    user-select: none;

    &.is-active {
      border-color: rgba(0, 0, 0, 0.45);
    }
  }
  &__radio {
    transform: translateY(1px);
  }
  &__pay-text {
    font-weight: 700;
  }

  &__error {
    margin: 8px 0 0;
    color: #d11;
    font-size: 13px;
  }

  &__footer {
    margin-top: 14px;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    padding-top: 14px;
  }
  &__summary {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 12px;
  }
  &__summary-label {
    margin: 0;
    opacity: 0.75;
  }
  &__summary-value {
    margin: 0;
    font-size: 18px;
    font-weight: 800;
  }

  &__submit {
    width: 100%;
    border: 0;
    border-radius: 12px;
    padding: 12px 14px;
    font-weight: 800;
    cursor: pointer;
    background: #111;
    color: #fff;
  }

  &__tip {
    margin: 10px 0 0;
    font-size: 12px;
    opacity: 0.7;
    text-align: center;
  }
}
</style>
