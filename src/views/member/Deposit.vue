<!-- src/views/member/Deposit.vue -->
<template>
  <section class="deposit">
    <header class="deposit__header">
      <h1 class="deposit__title">儲值</h1>
      <p class="deposit__subtitle">選擇儲值金額並完成付款</p>
    </header>

    <!-- 餘額卡片（改用 store） -->
    <div class="deposit__card">
      <div class="deposit__balance">
        <p class="deposit__balance-label">目前餘額</p>
        <p class="deposit__balance-value">
          {{ memberWallet.formatNumber(memberWallet.wallet.goldCoins) }}
        </p>
      </div>
      <p class="deposit__hint">儲值完成後會立即更新至錢包</p>
    </div>

    <!-- 表單 -->
    <form class="deposit__card" @submit.prevent="onSubmit">
      <!-- 方案 / 金額 -->
      <div class="deposit__section">
        <p class="deposit__section-title">選擇儲值方案</p>

        <div v-if="loadingPlans" class="deposit__loading">載入方案中…</div>

        <div v-else class="deposit__amount-grid">
          <button
            v-for="p in plans"
            :key="p.id"
            type="button"
            class="deposit__amount-btn"
            :class="{ 'is-active': selectedPlanId === p.id }"
            @click="selectPlan(p)"
          >
            <div class="deposit__planTop">
              <span class="deposit__planName">
                {{ p.title || `方案 ${p.id}` }}
              </span>
              <span class="deposit__planAmt">
                NT$ {{ Number(p.amount || 0).toLocaleString() }}
              </span>
            </div>

            <p v-if="p.bonusText" class="deposit__planMini">
              {{ p.bonusText }}
            </p>

            <p v-if="p.description" class="deposit__planMini">
              {{ p.description }}
            </p>
          </button>

          <div v-if="plans.length === 0" class="deposit__emptyPlan">
            目前沒有可用方案
          </div>
        </div>
      </div>

      <!-- 付款方式 -->
      <div class="deposit__section">
        <p class="deposit__section-title">付款方式</p>

        <div class="deposit__pay-grid">
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
            :class="{ 'is-active': paymentMethod === 'ATM' }"
          >
            <input
              class="deposit__radio"
              type="radio"
              value="ATM"
              v-model="paymentMethod"
            />
            <span class="deposit__pay-text">ATM 轉帳</span>
          </label>

          <label
            class="deposit__pay-item"
            :class="{ 'is-active': paymentMethod === 'CVS' }"
          >
            <input
              class="deposit__radio"
              type="radio"
              value="CVS"
              v-model="paymentMethod"
            />
            <span class="deposit__pay-text">超商代碼</span>
          </label>
        </div>

        <p v-if="errors.paymentMethod" class="deposit__error">
          {{ errors.paymentMethod }}
        </p>
      </div>

      <!-- 確認區 -->
      <div class="deposit__footer">
        <div class="deposit__summary">
          <p class="deposit__summary-label">本次儲值</p>
          <p class="deposit__summary-value">
            NT$ {{ (values.amount || 0).toLocaleString() }}
          </p>
        </div>

        <button class="deposit__submit" type="submit" :disabled="submitting">
          {{ submitting ? '處理中…' : '確認儲值' }}
        </button>

        <p class="deposit__tip">點擊「確認儲值」代表你同意付款條款與相關規範</p>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useForm } from 'vee-validate';
import * as yup from 'yup';

import { getActiveRechargePlans } from '@/services/rechargePlanService';
import { createRechargeRequest } from '@/services/rechargeService';
import { executeApi } from '@/utils/executeApiUtils';

import { useMemberWalletStore } from '@/stores/memberWallet';

type PayMethod = 'CREDIT_CARD' | 'ATM' | 'CVS';

const memberWallet = useMemberWalletStore();

const plans = ref<any[]>([]);
const loadingPlans = ref(false);
const selectedPlanId = ref('');

// ===== form =====
const schema = yup.object({
  amount: yup
    .number()
    .typeError('請輸入儲值金額')
    .required('請選擇或輸入儲值金額')
    .min(1, '金額需大於 0'),
  paymentMethod: yup
    .mixed<PayMethod>()
    .oneOf(['CREDIT_CARD', 'ATM', 'CVS'], '請選擇付款方式')
    .required('請選擇付款方式'),
});

const {
  errors,
  values,
  defineField,
  handleSubmit,
  setFieldValue,
  setFieldError,
} = useForm({
  validationSchema: schema,
  initialValues: {
    amount: 0,
    paymentMethod: 'CREDIT_CARD' as PayMethod,
  },
});

const [amount] = defineField('amount');
const [paymentMethod] = defineField('paymentMethod');

const buildBonusText = (p) => {
  const v = Number(p.bonusGold ?? p.bonusAmount ?? p.giftGold ?? 0) || 0;
  if (!v) return '';
  return `贈送：${v.toLocaleString()}`;
};

const selectPlan = (p) => {
  selectedPlanId.value = p.id;
  const amt = Number(p.amount ?? 0) || 0;
  setFieldValue('amount', amt);
};

// ===== api =====
const loadPlans = async () => {
  loadingPlans.value = true;

  await executeApi<any>({
    fn: () => getActiveRechargePlans(),
    onSuccess: (raw) => {
      // 你的 executeApi onSuccess 通常拿到 data
      // 但這裡仍兼容：raw / raw.data / raw.data.data
      const data = raw?.data?.data ?? raw?.data ?? raw;
      const list = Array.isArray(data) ? data : [];

      plans.value = list.map((x: any) => {
        const p: any = {
          id: String(x.id ?? ''),
          title: x.title ?? x.name ?? undefined,
          description: x.description ?? undefined,
          amount: x.amount ?? x.price ?? x.rechargeAmount ?? 0,
          bonusGold: x.bonusGold ?? undefined,
          bonusAmount: x.bonusAmount ?? undefined,
          giftGold: x.giftGold ?? undefined,
        };
        p.bonusText = buildBonusText(p);
        return p;
      });
    },
    onFinal: () => {
      loadingPlans.value = false;
    },
  });
};

const submitting = ref(false);

const onSubmit = handleSubmit(async (form) => {
  if (!selectedPlanId.value) {
    setFieldError('amount', '請先選擇一個儲值方案');
    return;
  }

  submitting.value = true;

  const payload = {
    planId: selectedPlanId.value,
    paymentMethod: form.paymentMethod,
  };

  await executeApi<any>({
    fn: () => createRechargeRequest(payload),

    showSuccessDialog: true,
    showFailDialog: true,

    successTitle: '儲值成功',
    successMessage: `已完成儲值 NT$ ${Number(values.amount || 0).toLocaleString()}，餘額已更新。`,

    errorTitle: '儲值失敗',
    errorMessage: '儲值未完成，請稍後再試或更換方案。',

    onSuccess: async (_data) => {
      await memberWallet.loadMe();
    },

    onFinal: async () => {
      submitting.value = false;
    },
  });
});

onMounted(async () => {
  await memberWallet.loadMe();
  await loadPlans();
});
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

  &__loading {
    opacity: 0.7;
    font-size: 13px;
    padding: 6px 0;
  }

  &__amount-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;

    @media (max-width: 640px) {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }
  }

  &__amount-btn {
    border: 1px solid rgba(0, 0, 0, 0.12);
    background: #fff;
    border-radius: 12px;
    padding: 12px 10px;
    cursor: pointer;
    font-weight: 700;
    text-align: left;

    &.is-active {
      border-color: rgba(0, 0, 0, 0.45);
      transform: translateY(-1px);
    }
  }

  &__planTop {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 10px;
  }

  &__planName {
    font-weight: 800;
  }

  &__planAmt {
    font-weight: 900;
  }

  &__planMini {
    margin: 6px 0 0;
    font-size: 12px;
    opacity: 0.75;
    line-height: 1.3;
  }

  &__emptyPlan {
    grid-column: 1 / -1;
    border: 1px dashed rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    padding: 14px;
    text-align: center;
    opacity: 0.7;
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

  &__tipSmall {
    margin: 8px 0 0;
    font-size: 12px;
    opacity: 0.65;
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

    &:disabled {
      opacity: 0.6;
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
