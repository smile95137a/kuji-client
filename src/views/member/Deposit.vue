<template>
  <section class="deposit">
    <header class="deposit__header">
      <h1 class="deposit__title">儲值</h1>
      <p class="deposit__subtitle">選擇儲值金額並完成付款</p>
    </header>

    <!-- 餘額卡片 -->
    <div class="deposit__card">
      <div class="deposit__balance">
        <p class="deposit__balance-label">目前餘額</p>
        <p class="deposit__balance-value">{{ balance.toLocaleString() }}</p>
      </div>
      <p class="deposit__hint">儲值完成後會立即更新至錢包</p>
    </div>

    <!-- 表單 -->
    <form class="deposit__card" @submit.prevent="onSubmit">
      <!-- 快速選金額 -->
      <div class="deposit__section">
        <p class="deposit__section-title">選擇儲值金額</p>

        <div class="deposit__amount-grid">
          <button
            v-for="amt in quickAmounts"
            :key="amt"
            type="button"
            class="deposit__amount-btn"
            :class="{ 'is-active': values.amount === amt }"
            @click="setAmount(amt)"
          >
            NT$ {{ amt.toLocaleString() }}
          </button>
        </div>

        <!-- 自訂金額 -->
        <div class="deposit__field">
          <label class="deposit__label">或自訂金額</label>
          <input
            class="deposit__input"
            type="number"
            inputmode="numeric"
            min="1"
            placeholder="輸入儲值金額（NT$）"
            v-model.number="amount"
          />
          <p v-if="errors.amount" class="deposit__error">{{ errors.amount }}</p>
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

        <button class="deposit__submit" type="submit">確認儲值</button>

        <p class="deposit__tip">點擊「確認儲值」代表你同意付款條款與相關規範</p>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useForm } from 'vee-validate';
import * as yup from 'yup';

type PayMethod = 'CREDIT_CARD' | 'ATM' | 'CVS';

const balance = ref(1280); // TODO: 換成你的 wallet store / API

const quickAmounts = [200, 500, 1000, 2000, 5000];

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

const { errors, values, defineField, handleSubmit, setFieldValue } = useForm({
  validationSchema: schema,
  initialValues: {
    amount: 0,
    paymentMethod: 'CREDIT_CARD' as PayMethod,
  },
});

const [amount] = defineField('amount');
const [paymentMethod] = defineField('paymentMethod');

const setAmount = (amt: number) => {
  setFieldValue('amount', amt);
};

const onSubmit = handleSubmit(async (form) => {
  // TODO: 這裡接你的儲值 API / submitPaymentForm
  // 例如：await createDepositOrder(form)
  console.log('deposit submit:', form);

  // Demo: 成功後更新餘額
  balance.value += form.amount;
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
